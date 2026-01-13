import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const allowedOrigins = [
  'https://ievggapvfidhygkhtkug.lovableproject.com',
  'https://lovable.dev',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.dev') || origin.endsWith('.lovableproject.com')
  ) ? origin : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side image size validation (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    const estimatedSize = (imageBase64.length * 3) / 4;
    if (estimatedSize > maxSizeBytes) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum 5MB allowed." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate base64 image format
    if (!imageBase64.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: "Invalid image format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling OpenRouter API for handwriting analysis...");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.dev",
        "X-Title": "Handwriting Analyzer"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `You are an expert handwriting analyst and calligraphy specialist. Your task is to analyze handwriting samples with extreme precision to enable perfect digital recreation.

Analyze every aspect of the handwriting including:
- Letter formation patterns and stroke directions
- Pen pressure variations (light, medium, heavy)
- Slant angle (vertical, right-leaning, left-leaning)
- Letter spacing consistency
- Word spacing patterns
- Baseline stability or natural waviness
- Letter size variations
- Ascender and descender characteristics
- Connection styles between letters
- Overall rhythm and flow
- Unique personal quirks in letter formation

You must respond with a JSON object containing these properties:
- suggestedFont: one of these values based on best match: "caveat", "kalam", "patrick-hand", "shadows-into-light", "indie-flower", "dancing-script", "architects-daughter", "satisfy", "gloria-hallelujah", "covered-by-your-grace", "rock-salt", "reenie-beanie", "homemade-apple", "nothing-you-could-do", "cedarville-cursive", "la-belle-aurore"
- fontSize: number between 18-36 (match apparent size)
- lineSpacing: number between 24-50 (match line height)
- wordSpacing: number between 2-10 (match word gaps)
- baselineJitter: boolean (true if baseline is wavy/uneven)
- strokeRandomness: boolean (true if letter sizes/angles vary)
- inkColor: one of "blue", "black", "red", "green", "purple", "brown", "teal", "orange" (detected or default "blue")
- slant: number between -15 and 15 (negative = left lean, positive = right lean, 0 = vertical)
- strokeThickness: number between 1-5 (pen stroke weight)
- penPressureFeel: number between 1-10 (1 = very light, 10 = very heavy pressure)
- analysisNotes: string (detailed description of handwriting characteristics, personality traits it might indicate, and why you chose the specific settings)

Font selection guide:
- "caveat" - casual, slightly rushed cursive
- "kalam" - neat, rounded handwriting
- "patrick-hand" - clean, friendly print
- "shadows-into-light" - light, airy cursive
- "indie-flower" - youthful, bubbly
- "dancing-script" - elegant, flowing cursive
- "architects-daughter" - technical, precise
- "satisfy" - bold, artistic cursive
- "gloria-hallelujah" - playful, energetic
- "covered-by-your-grace" - delicate, feminine
- "rock-salt" - rough, textured
- "reenie-beanie" - quick, informal
- "homemade-apple" - rustic, natural
- "nothing-you-could-do" - loose, casual
- "cedarville-cursive" - classic cursive
- "la-belle-aurore" - vintage, romantic`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this handwriting sample in detail and provide precise settings to recreate this exact handwriting style digitally. Look at every aspect - the pressure, slant, spacing, letter formation, and any unique characteristics. Respond with only the JSON object, no markdown formatting."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "API authentication error. Please check your API key." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("OpenRouter response received");
    
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
      console.log("Successfully parsed analysis result");
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-handwriting function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
