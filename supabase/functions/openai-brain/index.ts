import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AI Provider Configuration
interface AIProvider {
  name: string;
  baseUrl: string;
  models: {
    vision: string;
    reasoning: string;
    fast: string;
  };
  getKey: () => string | undefined;
}

const providers: AIProvider[] = [
  {
    name: "openai",
    baseUrl: "https://api.openai.com/v1",
    models: {
      vision: "gpt-4o",           // Best for image analysis
      reasoning: "gpt-4o",         // Best for complex reasoning/essays
      fast: "gpt-4o-mini",         // Fast and cheap for simple text
    },
    getKey: () => Deno.env.get("OPENAI_API_KEY"),
  },
  {
    name: "lovable",
    baseUrl: "https://ai.gateway.lovable.dev/v1",
    models: {
      vision: "google/gemini-2.5-pro",    // Vision capable
      reasoning: "google/gemini-2.5-pro", // Strong reasoning
      fast: "google/gemini-2.5-flash",    // Fast fallback
    },
    getKey: () => Deno.env.get("LOVABLE_API_KEY"),
  },
];

// Mode to model type mapping
const modeToModelType: Record<string, 'vision' | 'reasoning' | 'fast'> = {
  solve: 'reasoning',
  essay: 'reasoning',
  explain: 'reasoning',
  improve: 'fast',
  summarize: 'fast',
  rewrite: 'fast',
  template: 'fast',
  notes: 'fast',
  ocr_solve: 'vision',
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
}

interface AIRequest {
  action: string;
  content: string;
  imageBase64?: string;
  mode?: string;
  stream?: boolean;
}

/**
 * Intelligently routes AI requests to the appropriate model based on:
 * 1. Whether an image is present (use vision model)
 * 2. The action/mode type (essay/solve = reasoning, simple tasks = fast)
 * 3. Content length (long content = reasoning model)
 */
function selectModelType(request: AIRequest): 'vision' | 'reasoning' | 'fast' {
  // Image input always requires vision model
  if (request.imageBase64) {
    return 'vision';
  }

  // Check action-specific routing
  const actionType = modeToModelType[request.action];
  if (actionType) {
    return actionType;
  }

  // Long content (>2000 chars) benefits from reasoning model
  if (request.content && request.content.length > 2000) {
    return 'reasoning';
  }

  // Default to fast model
  return 'fast';
}

/**
 * Build system prompt based on mode and action
 */
function buildSystemPrompt(action: string, mode: string): string {
  const modePrompts: Record<string, string> = {
    student: "You are a helpful tutor for school students. Use simple language, provide step-by-step explanations, and be encouraging. Format solutions clearly with numbered steps.",
    college: "You are an academic assistant for college students. Provide detailed, well-structured responses with proper citations when applicable. Use academic language and thorough explanations.",
    professional: "You are a professional assistant. Provide concise, executive-level responses with clear actionable insights. Focus on efficiency and practical application."
  };

  const actionPrompts: Record<string, string> = {
    solve: "Solve this problem completely. Show all steps clearly and provide the final answer.",
    explain: "Explain this concept in detail. Break it down into understandable parts.",
    improve: "Improve this text. Make it clearer, more engaging, and better structured.",
    summarize: "Summarize this content concisely. Capture the key points.",
    rewrite: "Rewrite this professionally while maintaining the core meaning.",
    essay: "Write a comprehensive essay on this topic with introduction, body paragraphs, and conclusion.",
    template: "Create a professional template/outline for this topic that can be filled in.",
    notes: "Create concise, well-organized study notes from this content with key points and highlights.",
    ocr_solve: "I've extracted text from an image. Analyze this homework/assignment question and provide a complete, step-by-step solution. Show all work clearly."
  };

  return `${modePrompts[mode] || modePrompts.student}

${actionPrompts[action] || "Help the user with their request."}

Format your response using Markdown for better readability:
- Use **bold** for important terms
- Use numbered lists for steps
- Use headers (##) to organize sections
- Use code blocks for formulas or code
- Use bullet points for key takeaways`;
}

/**
 * Make AI request with automatic fallback between providers
 */
async function makeAIRequest(
  messages: ChatMessage[],
  modelType: 'vision' | 'reasoning' | 'fast',
  stream: boolean,
  hasImage: boolean
): Promise<{ response: Response; provider: string; model: string }> {
  
  for (const provider of providers) {
    const apiKey = provider.getKey();
    if (!apiKey) continue;

    const model = provider.models[modelType];
    console.log(`Trying ${provider.name} with model ${model} (type: ${modelType})`);

    try {
      // Transform messages for Lovable AI vision (use inline_data format for images)
      let requestMessages = messages;
      
      if (provider.name === "lovable" && hasImage) {
        // Lovable/Gemini supports vision but needs proper format
        requestMessages = messages.map(m => {
          if (typeof m.content === "string") return m;
          // Convert OpenAI format to Gemini-compatible format
          const textPart = (m.content as { type: string; text?: string }[]).find(p => p.type === "text");
          const imagePart = (m.content as { type: string; image_url?: { url: string } }[]).find(p => p.type === "image_url");
          
          if (imagePart?.image_url?.url) {
            return {
              role: m.role,
              content: [
                { type: "text", text: textPart?.text || "Analyze this image" },
                { type: "image_url", image_url: { url: imagePart.image_url.url } }
              ]
            };
          }
          return { role: m.role, content: textPart?.text || "" };
        });
      }

      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
          stream,
          max_tokens: 4096,
          temperature: 0.7,
        }),
      });

      // Check for quota/rate limit errors and try next provider
      if (!response.ok) {
        const status = response.status;
        if (status === 429 || status === 402) {
          console.log(`${provider.name} quota/rate limit, trying next provider`);
          continue;
        }
        // Other errors, try next provider
        const errorText = await response.text();
        console.error(`${provider.name} error ${status}: ${errorText}`);
        continue;
      }

      return { response, provider: provider.name, model };
    } catch (error) {
      console.error(`${provider.name} request failed:`, error);
      continue;
    }
  }

  throw new Error("All AI providers failed or unavailable");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // CRITICAL: Verify authentication - REQUIRED for all requests
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please sign in to use AI features" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT - this is mandatory
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error("JWT verification failed:", userError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`AI Brain request from user: ${userId}`);

    const body: AIRequest = await req.json();
    const { 
      action, 
      content, 
      imageBase64, 
      mode = "student",
      stream = false 
    } = body;

    console.log(`AI Brain: action=${action}, mode=${mode}, hasImage=${!!imageBase64}, contentLength=${content?.length || 0}`);

    // Intelligent model selection
    const modelType = selectModelType(body);
    console.log(`Selected model type: ${modelType}`);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(action, mode);

    // Build messages array
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt }
    ];

    // Handle image input for OCR/vision tasks
    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: content || "Please analyze this image and solve any problems shown." },
          { 
            type: "image_url", 
            image_url: { 
              url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
            } 
          }
        ]
      });
    } else {
      messages.push({ role: "user", content });
    }

    // Make AI request with automatic fallback
    const { response: aiResponse, provider, model } = await makeAIRequest(
      messages,
      modelType,
      stream,
      !!imageBase64
    );

    // Log activity for tracking
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: imageBase64 ? 'ai_vision_process' : 'ai_document_process',
        category: 'ai',
        details: { action, mode, modelType, provider, hasImage: !!imageBase64, contentLength: content?.length || 0 },
        page_url: '/ai-solver',
      });
    } catch (logError) {
      console.warn("Failed to log activity:", logError);
    }

    // Handle streaming response
    if (stream) {
      console.log(`Streaming response from ${provider} (${model})`);
      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Handle non-streaming response
    const data = await aiResponse.json();
    const result = data.choices?.[0]?.message?.content || "";
    
    console.log(`AI Brain (${provider}/${model}): Response generated, length=${result.length}`);

    return new Response(
      JSON.stringify({ 
        result,
        provider,
        model,
        modelType,
        usage: data.usage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Brain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
