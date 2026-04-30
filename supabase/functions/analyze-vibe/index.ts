// Vybify - AI image -> song recommendations
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Vybify — an advanced AI music recommendation engine for Gen-Z social media stories (Instagram-style).

Analyze the uploaded image(s) and recommend REAL existing songs (Hindi + English).

DETECT: mood (happy/sad/romantic/aesthetic/party/lonely/confident/travel...), scene, energy (low/medium/high), lighting/style, context (friends/solo/couple/celebration/workout...). For multiple images, find dominant overall vibe.

RULES:
- ONLY suggest real, well-known songs. Never invent songs.
- Mix trending + emotionally accurate picks.
- Think like a Gen-Z user picking a story song.
- Each recommendation needs: name, artist, why (1 short Gen-Z line).
- Provide 2-3 songs per category.
- Best pick = the single most perfect song.
- Caption = aesthetic, lowercase Gen-Z vibe, ≤80 chars.
- Hashtags = 3-5 relevant tags.

Return ONLY valid JSON via the provided tool.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { images } = await req.json(); // array of base64 data URLs
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "No images provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userContent: any[] = [
      { type: "text", text: "Analyze this image (or images) and recommend the perfect songs for an Instagram story." },
      ...images.map((url: string) => ({ type: "image_url", image_url: { url } })),
    ];

    const tool = {
      type: "function",
      function: {
        name: "vybify_recommendation",
        description: "Return Vybify song recommendations for the analyzed image(s).",
        parameters: {
          type: "object",
          properties: {
            vibe_summary: { type: "string", description: "1-2 line human-friendly vibe summary" },
            mood: { type: "string" },
            energy: { type: "string", enum: ["low", "medium", "high"] },
            context: { type: "string" },
            style: { type: "string" },
            hindi_vocal: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" }, artist: { type: "string" }, why: { type: "string" } }, required: ["name","artist","why"] },
            },
            english_vocal: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" }, artist: { type: "string" }, why: { type: "string" } }, required: ["name","artist","why"] },
            },
            instrumental: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" }, artist: { type: "string" }, why: { type: "string" } }, required: ["name","artist","why"] },
            },
            best_pick: {
              type: "object",
              properties: { name: { type: "string" }, artist: { type: "string" }, why: { type: "string" } },
              required: ["name","artist","why"],
            },
            caption: { type: "string" },
            hashtags: { type: "array", items: { type: "string" } },
          },
          required: ["vibe_summary","mood","energy","context","style","hindi_vocal","english_vocal","instrumental","best_pick","caption","hashtags"],
        },
      },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "vybify_recommendation" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Too many requests, slow down ✋" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-vibe error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
