import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per hour

async function checkRateLimit(
  supabase: any,
  userId: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW * 1000);
  
  // Get current request count within window
  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open but log the error
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW * 1000) };
  }

  const currentCount = count || 0;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - currentCount - 1);
  const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW * 1000);
  
  if (currentCount >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Record this request
  await supabase.from('rate_limits').insert({
    user_id: userId,
    endpoint,
    window_start: now.toISOString(),
  });

  return { allowed: true, remaining, resetAt };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's JWT using the provided token (do not rely on an internal session)
    const token = authHeader.replace("Bearer ", "").trim();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error("JWT verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    console.log(`Analyze handwriting request from user: ${userId}`);

    // Check rate limit using service role client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { allowed, remaining, resetAt } = await checkRateLimit(adminClient, userId, 'analyze-handwriting');
    
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

    console.log("Calling Lovable AI for advanced handwriting analysis...");

    const systemPrompt = `You are an expert forensic handwriting analyst and typography specialist with 30+ years of experience. Your task is to analyze handwriting samples with EXTREME precision to enable PERFECT digital recreation that is INDISTINGUISHABLE from real handwriting.

ANALYSIS REQUIREMENTS:
1. STROKE ANALYSIS
   - Pen pressure patterns (where pressure increases/decreases)
   - Stroke start and end characteristics (flicks, hooks, trails)
   - Connection patterns between letters
   - Pen lift frequency within words

2. LETTER FORMATION
   - Individual character proportions (width/height ratios)
   - Loop sizes in letters like 'a', 'o', 'e', 'd', 'b', 'g', 'p', 'q'
   - Ascender heights (b, d, f, h, k, l)
   - Descender depths (g, j, p, q, y)
   - X-height consistency

3. SPATIAL ANALYSIS
   - Letter spacing patterns (tight, normal, loose)
   - Word spacing consistency
   - Line spacing and baseline drift
   - Margin behavior

4. STYLISTIC ELEMENTS
   - Slant angle (measure in degrees)
   - Curvature vs angular strokes
   - Unique letter formations (how they write specific letters)
   - Personal quirks and identifying characteristics

5. NATURAL IMPERFECTIONS (CRITICAL)
   - Baseline waviness patterns
   - Size inconsistency between repeated letters
   - Pressure variations
   - Speed indicators (rushed vs careful)

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "suggestedFont": "font-name",
  "fontSize": number,
  "lineSpacing": number,
  "wordSpacing": number,
  "letterSpacing": number,
  "baselineJitter": boolean,
  "baselineJitterAmount": number,
  "strokeRandomness": boolean,
  "strokeRandomnessAmount": number,
  "inkColor": "color",
  "slant": number,
  "strokeThickness": number,
  "penPressureFeel": number,
  "characterVariance": {
    "sizeVariance": number,
    "rotationVariance": number,
    "spacingVariance": number,
    "yOffsetVariance": number
  },
  "strokeCharacteristics": {
    "startWeight": number,
    "endWeight": number,
    "midWeight": number,
    "flicks": boolean,
    "hooks": boolean
  },
  "naturalImperfections": {
    "inkBleed": number,
    "pressureVariation": number,
    "speedVariation": number,
    "connectionStrength": number
  },
  "analysisNotes": "detailed analysis",
  "personalityTraits": "what this handwriting reveals about the writer",
  "confidence": number
}

FONT OPTIONS (choose the CLOSEST match):
- "caveat" - casual, slightly rushed, natural flow
- "kalam" - neat, rounded, consistent
- "patrick-hand" - clean, friendly, printed style
- "shadows-into-light" - light, airy, feminine
- "indie-flower" - youthful, bubbly, playful
- "dancing-script" - elegant, flowing cursive
- "architects-daughter" - technical, precise, neat
- "satisfy" - bold, artistic, confident
- "gloria-hallelujah" - playful, energetic, casual
- "covered-by-your-grace" - delicate, flowing
- "rock-salt" - rough, textured, bold
- "reenie-beanie" - quick, informal, natural
- "homemade-apple" - rustic, authentic
- "nothing-you-could-do" - loose, casual, fast
- "cedarville-cursive" - classic cursive, connected
- "la-belle-aurore" - vintage, romantic, elegant

CRITICAL: The goal is to make digital notes COMPLETELY INDISTINGUISHABLE from real handwriting. Every subtle variation matters.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this handwriting sample with EXTREME precision. Look at EVERY detail:
- How each letter is formed
- Pressure variations throughout strokes
- Natural imperfections and variations
- Spacing patterns
- Baseline behavior
- Any unique characteristics

The goal is to recreate this EXACT handwriting digitally so it's IMPOSSIBLE to tell apart from the original.
Respond ONLY with the JSON object, no markdown or explanations.`
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
        max_tokens: 3000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Lovable AI response received");
    
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
      
      // Ensure all required fields have defaults
      analysisResult = {
        suggestedFont: analysisResult.suggestedFont || 'caveat',
        fontSize: analysisResult.fontSize || 24,
        lineSpacing: analysisResult.lineSpacing || 32,
        wordSpacing: analysisResult.wordSpacing || 4,
        letterSpacing: analysisResult.letterSpacing || 0,
        baselineJitter: analysisResult.baselineJitter ?? true,
        baselineJitterAmount: analysisResult.baselineJitterAmount || 2,
        strokeRandomness: analysisResult.strokeRandomness ?? true,
        strokeRandomnessAmount: analysisResult.strokeRandomnessAmount || 1,
        inkColor: analysisResult.inkColor || 'blue',
        slant: analysisResult.slant || 0,
        strokeThickness: analysisResult.strokeThickness || 1,
        penPressureFeel: analysisResult.penPressureFeel || 5,
        characterVariance: {
          sizeVariance: analysisResult.characterVariance?.sizeVariance || 0.05,
          rotationVariance: analysisResult.characterVariance?.rotationVariance || 1,
          spacingVariance: analysisResult.characterVariance?.spacingVariance || 0.5,
          yOffsetVariance: analysisResult.characterVariance?.yOffsetVariance || 1,
        },
        strokeCharacteristics: {
          startWeight: analysisResult.strokeCharacteristics?.startWeight || 1,
          endWeight: analysisResult.strokeCharacteristics?.endWeight || 0.8,
          midWeight: analysisResult.strokeCharacteristics?.midWeight || 1,
          flicks: analysisResult.strokeCharacteristics?.flicks ?? false,
          hooks: analysisResult.strokeCharacteristics?.hooks ?? false,
        },
        naturalImperfections: {
          inkBleed: analysisResult.naturalImperfections?.inkBleed || 0,
          pressureVariation: analysisResult.naturalImperfections?.pressureVariation || 0.1,
          speedVariation: analysisResult.naturalImperfections?.speedVariation || 0.1,
          connectionStrength: analysisResult.naturalImperfections?.connectionStrength || 0.5,
        },
        analysisNotes: analysisResult.analysisNotes || '',
        personalityTraits: analysisResult.personalityTraits || '',
        confidence: analysisResult.confidence || 0.85,
      };
      
      console.log("Successfully parsed advanced analysis result");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(analysisResult),
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
    console.error("Error in analyze-handwriting function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze handwriting. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
