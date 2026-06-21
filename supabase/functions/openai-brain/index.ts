import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const MAX_REQUESTS_PER_WINDOW = 30; // 30 AI brain requests per hour (increased for multi-agent)

async function checkRateLimit(
  supabase: any,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW * 1000);
  
  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW * 1000) };
  }

  const currentCount = count || 0;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - currentCount - 1);
  const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW * 1000);
  
  if (currentCount >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt };
  }

  await supabase.from('rate_limits').insert({
    user_id: userId,
    endpoint,
    window_start: now.toISOString(),
  });

  return { allowed: true, remaining, resetAt };
}

// ============================================================
// AI Provider Configuration
// ============================================================

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
      vision: "gpt-4o",
      reasoning: "gpt-4o",
      fast: "gpt-4o-mini",
    },
    getKey: () => Deno.env.get("OPENAI_API_KEY"),
  },
  {
    name: "lovable",
    baseUrl: "https://ai.gateway.lovable.dev/v1",
    models: {
      vision: "google/gemini-2.5-pro",
      reasoning: "google/gemini-2.5-pro",
      fast: "google/gemini-2.5-flash",
    },
    getKey: () => Deno.env.get("LOVABLE_API_KEY"),
  },
];

// ============================================================
// NikNote 4.0 Agent System Prompts
// ============================================================

const AGENT_PROMPTS: Record<string, string> = {
  teacher: `You are an expert AI Teacher on NikNote — a learning platform for Indian students.
Your job is to EXPLAIN concepts clearly, like a real teacher would.
RULES:
- Start with a simple 2-line summary anyone can understand
- Then explain in 3 levels: Beginner → Intermediate → Exam-focused
- Use real-life examples Indian students relate to (cricket, chai, traffic, etc.)
- Include important formulas, definitions, and keywords
- Always add "Exam Tip" at the end
- Keep responses structured with clear headings
- Be warm, encouraging, but precise
- Use Hinglish when it helps understanding
- Response MUST be under 800 words`,

  notes: `You are the Notes Agent on NikNote — you create BEAUTIFUL, STRUCTURED notes.
RULES:
- Create well-organized notes with clear headings and subheadings
- Use bullet points for key information
- Highlight IMPORTANT keywords in **bold**
- Include formulas in separate lines
- Add "📝 Remember" boxes for critical points
- Add "⚠️ Common Mistake" warnings where students often go wrong
- Structure: Title → Overview → Key Concepts → Formulas → Examples → Summary
- Make notes that a student can revise in 10 minutes
- Include 3-5 practice questions at the end`,

  research: `You are the Research Agent on NikNote — you find ACCURATE, VERIFIED information.
RULES:
- Provide factually correct information from reliable sources
- Cite sources when possible (NCERT, standard textbooks)
- Cross-verify important claims
- Present multiple perspectives when relevant
- Flag any controversial or disputed information
- Keep information concise and exam-relevant`,

  diagram: `You are the Diagram Agent on NikNote — you describe and suggest visual learning aids.
RULES:
- When a topic is mentioned, suggest what diagrams would help understanding
- Describe diagrams in detail so they can be created
- Include flowcharts for processes
- Include labeled diagrams for structures
- Include graphs for relationships
- Suggest Mermaid.js syntax for diagrams where applicable
- Always explain WHY the diagram helps`,

  revision: `You are the Revision Agent on NikNote — you create CONCISE revision materials.
RULES:
- Create ultra-short summaries (1 page max)
- Use mnemonics where possible
- Create "cheat sheet" style revision notes
- Highlight ONLY what's important for exams
- Group related concepts together
- Add memory tricks and shortcuts
- Create before/after comparison tables`,

  quiz: `You are the Quiz Agent on NikNote — you create ENGAGING tests and MCQs.
RULES:
- Create 5-10 MCQs per topic
- Include easy, medium, and hard questions
- Always provide explanations for correct AND wrong answers
- Include "trick questions" that test deep understanding
- Add assertion-reason type questions (common in Indian exams)
- Add numerical problems where applicable
- Mark difficulty level for each question`,

  assignment: `You are the Assignment Agent on NikNote — you help students complete assignments.
RULES:
- Understand the assignment requirement
- Provide a step-by-step approach
- Give a structure/template for the answer
- Suggest key points to include
- Help format the answer properly
- Add references and citations
- DO NOT write the full answer — guide the student to write it themselves`,

  doubt: `You are the Doubt Solver Agent on NikNote — you answer questions INSTANTLY.
RULES:
- Answer directly and clearly
- If the doubt is unclear, ask clarifying questions
- Provide examples to illustrate the answer
- Reference related concepts the student should know
- Suggest what to study next
- Be patient and encouraging
- Never make the student feel dumb`,

  productivity: `You are the Productivity Agent on NikNote — you create study plans and schedules.
RULES:
- Create realistic study schedules based on exam dates
- Include breaks (Pomodoro technique)
- Suggest priority order for topics
- Include revision slots
- Create daily, weekly, and monthly plans
- Add tips for better focus and retention
- Suggest group study topics
- Keep plans flexible`,

  handwriting: `You are the Handwriting Analysis Agent on NikNote.
RULES:
- Analyze uploaded handwriting samples
- Identify: slant, pressure, stroke thickness, baseline drift, spacing, size variation
- Generate HandwritingDNA parameters
- Provide matching recommendations
- Give feedback on handwriting characteristics`,

  document: `You are the Document Intelligence Agent on NikNote.
RULES:
- Read and understand uploaded documents (PDF, images)
- Extract key information and concepts
- Generate summaries
- Identify important formulas, definitions, and diagrams
- Create structured notes from documents
- Suggest study topics from the document`,
};

// Legacy mode-to-prompt mapping (for backward compatibility)
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

// Agent to model type mapping (new)
const agentToModelType: Record<string, 'vision' | 'reasoning' | 'fast'> = {
  teacher: 'reasoning',
  notes: 'fast',
  research: 'reasoning',
  diagram: 'fast',
  revision: 'fast',
  quiz: 'fast',
  assignment: 'reasoning',
  doubt: 'fast',
  productivity: 'fast',
  handwriting: 'vision',
  document: 'vision',
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
  // NikNote 4.0 Agent fields
  messages?: ChatMessage[];
  agent?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Select model type based on request type
 * Priority: agent > image > action > content length
 */
function selectModelType(request: AIRequest): 'vision' | 'reasoning' | 'fast' {
  // New: Agent-based routing
  if (request.agent && agentToModelType[request.agent]) {
    return agentToModelType[request.agent];
  }

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
 * Build system prompt — supports both legacy and agent-based
 */
function buildSystemPrompt(request: AIRequest): string {
  // New: Agent-specific prompt
  if (request.agent && AGENT_PROMPTS[request.agent]) {
    return AGENT_PROMPTS[request.agent];
  }

  // Legacy: action/mode-based prompt
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

  return `${modePrompts[request.mode || 'student'] || modePrompts.student}\n\n${actionPrompts[request.action] || "Help the user with their request."}\n\nFormat your response using Markdown for better readability:\n- Use **bold** for important terms\n- Use numbered lists for steps\n- Use headers (##) to organize sections\n- Use code blocks for formulas or code\n- Use bullet points for key takeaways`;
}

/**
 * Make AI request with automatic fallback between providers
 */
async function makeAIRequest(
  messages: ChatMessage[],
  modelType: 'vision' | 'reasoning' | 'fast',
  stream: boolean,
  hasImage: boolean,
  temperature: number = 0.7,
  maxTokens: number = 4096
): Promise<{ response: Response; provider: string; model: string }> {
  
  for (const provider of providers) {
    const apiKey = provider.getKey();
    if (!apiKey) continue;

    const model = provider.models[modelType];
    console.log(`Trying ${provider.name} with model ${model} (type: ${modelType})`);

    try {
      let requestMessages = messages;
      
      if (provider.name === "lovable" && hasImage) {
        requestMessages = messages.map(m => {
          if (typeof m.content === "string") return m;
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
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429 || status === 402) {
          console.log(`${provider.name} quota/rate limit, trying next provider`);
          continue;
        }
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
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

    // Check rate limit using service role client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { allowed, remaining, resetAt } = await checkRateLimit(adminClient, userId, 'openai-brain');
    
    if (!allowed) {
      console.log(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((resetAt.getTime() - Date.now()) / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetAt.toISOString()
          } 
        }
      );
    }

    const body: AIRequest = await req.json();
    const { 
      action, 
      content, 
      imageBase64, 
      mode = "student",
      stream = false,
      messages: providedMessages,
      agent,
      temperature = 0.7,
      max_tokens = 2000,
    } = body;

    console.log(`AI Brain: agent=${agent || 'none'}, action=${action}, mode=${mode}, hasImage=${!!imageBase64}, hasMessages=${!!providedMessages}`);

    // Intelligent model selection
    const modelType = selectModelType(body);
    console.log(`Selected model type: ${modelType}`);

    // Build messages array
    let messages: ChatMessage[];

    if (providedMessages && providedMessages.length > 0) {
      // New agent-based: use provided messages (already include system prompt from agent)
      messages = providedMessages;
    } else {
      // Legacy: build from action/content
      const systemPrompt = buildSystemPrompt(body);
      messages = [{ role: "system", content: systemPrompt }];

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
    }

    // Make AI request with automatic fallback
    const { response: aiResponse, provider, model } = await makeAIRequest(
      messages,
      modelType,
      stream,
      !!imageBase64,
      temperature,
      max_tokens
    );

    // Log activity for tracking
    try {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: imageBase64 ? 'ai_vision_process' : agent ? `ai_agent_${agent}` : 'ai_document_process',
        category: 'ai',
        details: { action, mode, agent, modelType, provider, hasImage: !!imageBase64, contentLength: content?.length || 0 },
        page_url: agent ? '/ai' : '/ai-solver',
      });
    } catch (logError) {
      console.warn("Failed to log activity:", logError);
    }

    // Handle streaming response
    if (stream) {
      console.log(`Streaming response from ${provider} (${model})`);
      return new Response(aiResponse.body, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": resetAt.toISOString()
        },
      });
    }

    // Handle non-streaming response
    const data = await aiResponse.json();
    const result = data.choices?.[0]?.message?.content || "";
    
    console.log(`AI Brain (${provider}/${model}): Response generated, length=${result.length}`);

    return new Response(
      JSON.stringify({ 
        content: result,  // New format for agent responses
        result,           // Legacy format
        provider,
        model,
        modelType,
        agent: agent || null,
        usage: data.usage
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": resetAt.toISOString()
        } 
      }
    );

  } catch (error) {
    console.error("AI Brain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
