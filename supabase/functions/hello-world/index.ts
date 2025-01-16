import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

console.log("関数開始");

serve(async (req) => {
  console.log(`リクエスト受信: ${req.method} ${req.url}`);
  
  // リクエストヘッダーのログ出力を追加
  console.log("リクエストヘッダー:", Object.fromEntries(req.headers));

  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const body = await req.text();
    console.log("リクエストボディ:", body);
    const { input } = JSON.parse(body);
    console.log(`受信したinput: ${input}`);
    const data = {
      message: `hello world, ${input}`
    };
    return new Response(JSON.stringify(data), { headers });
  } catch (error) {
    console.error("エラー詳細:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers,
      status: 400,
    });
  }
});
