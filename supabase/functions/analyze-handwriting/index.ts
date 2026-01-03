import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let analysisResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-handwriting function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
