import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!OPENAI_API_KEY && !LOVABLE_API_KEY) {
      console.error("No AI API key configured");
      return new Response(
        JSON.stringify({ error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { 
      action, 
      content, 
      imageBase64, 
      mode = "student",
      stream = false 
    } = body;

    console.log(`AI Brain: action=${action}, mode=${mode}, hasImage=${!!imageBase64}`);

    // Build system prompt based on mode and action
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

    const systemPrompt = `${modePrompts[mode] || modePrompts.student}

${actionPrompts[action] || "Help the user with their request."}

Format your response using Markdown for better readability:
- Use **bold** for important terms
- Use numbered lists for steps
- Use headers (##) to organize sections
- Use code blocks for formulas or code
- Use bullet points for key takeaways`;

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
      messages.push({ role: "user", content: content });
    }

    // Try OpenAI first, fallback to Lovable AI
    let aiResponse: Response | null = null;
    let usedProvider = "openai";

    if (OPENAI_API_KEY) {
      try {
        aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: imageBase64 ? "gpt-4o" : "gpt-4o-mini",
            messages,
            stream,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        // Check for quota errors and fallback
        if (!aiResponse.ok && (aiResponse.status === 429 || aiResponse.status === 402)) {
          const errorData = await aiResponse.json().catch(() => ({}));
          const errorType = errorData?.error?.type;
          
          if (errorType === "insufficient_quota" && LOVABLE_API_KEY && !imageBase64) {
            console.log("OpenAI quota exceeded, falling back to Lovable AI");
            usedProvider = "lovable";
            aiResponse = null; // Trigger fallback
          }
        }
      } catch (e) {
        console.error("OpenAI request failed:", e);
        if (LOVABLE_API_KEY && !imageBase64) {
          usedProvider = "lovable";
        }
      }
    }

    // Fallback to Lovable AI (doesn't support images)
    if (!aiResponse && LOVABLE_API_KEY && !imageBase64) {
      console.log("Using Lovable AI as fallback");
      
      const lovableMessages = messages.map(m => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : (m.content as any[])[0]?.text || ""
      }));

      aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: lovableMessages,
          stream,
        }),
      });
    }

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: "No AI provider available. Please check your API keys." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI processing failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle streaming response
    if (stream) {
      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Handle non-streaming response
    const data = await aiResponse.json();
    const result = data.choices?.[0]?.message?.content || "";
    
    console.log(`AI Brain (${usedProvider}): Response generated, length=${result.length}`);

    return new Response(
      JSON.stringify({ 
        result,
        provider: usedProvider,
        model: imageBase64 ? "gpt-4o" : (usedProvider === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash"),
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
