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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a handwriting analysis expert. Analyze the uploaded handwriting image and determine the characteristics of the handwriting style. 
            
You must respond with a JSON object containing these properties:
- suggestedFont: one of these values: "caveat", "kalam", "patrick-hand", "shadows-into-light", "indie-flower", "dancing-script", "architects-daughter", "satisfy", "gloria-hallelujah", "covered-by-your-grace", "rock-salt", "reenie-beanie", "homemade-apple", "nothing-you-could-do", "cedarville-cursive", "la-belle-aurore"
- fontSize: number between 18-36 (estimated relative size)
- lineSpacing: number between 24-50 (estimated line height)
- wordSpacing: number between 2-10 (space between words)
- baselineJitter: boolean (true if writing is wavy/uneven)
- strokeRandomness: boolean (true if letters vary in size/angle)
- inkColor: one of "blue", "black", "red", "green", "purple", "brown", "teal", "orange" (based on pen color if visible, default "blue")
- analysisNotes: string (brief description of the handwriting characteristics)

Choose the font that best matches the handwriting style in the image. Consider:
- Cursive vs print style
- Messy vs neat
- Formal vs casual
- Letter slant and size consistency`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this handwriting sample and provide style settings to recreate a similar look. Respond with only the JSON object, no markdown."
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
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service unavailable. Please try again later." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
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
    } catch (parseError) {
      console.error("Failed to parse AI response");
      return new Response(
        JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
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
