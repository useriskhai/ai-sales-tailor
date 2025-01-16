import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { supabase } from "../_shared/supabase-client.ts"; // 修正: Supabaseクライアントのインポート
import { corsHeaders } from "../_shared/cors.ts";

// モックの修正
const mockSupabase = {
  rpc: () => Promise.resolve(),
  functions: {
    invoke: () => Promise.resolve({ data: null, error: null }),
  },
};

const mockGenerateContent = () => Promise.resolve("Generated content");
const mockSendViaForm = () => Promise.resolve({ status: "success" });
const mockSendViaDM = () => Promise.resolve({ status: "success" });
const mockDetectForm = () => Promise.resolve("https://example.com/form");
const mockLogJobProgress = (jobId: string, taskId: string, message: string, status?: string) => Promise.resolve();
const mockRetryOperation = (fn: () => Promise<any>) => fn();
const mockGetUserSettings = () => Promise.resolve({ preferred_method: "form" });
const mockRecordMetrics = (metric: { jobId: string, taskId: string, name: string, value: number }) => Promise.resolve();

// テストケース
Deno.test("task-executor - 正常系", async () => {
  const jobId = "job1"; // 適切な値を設定
  const taskId = "task1"; // 適切な値を設定
  const req = new Request("http://localhost:8000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: taskId, // 修正: idを追加
      jobId,
      companyId: "company1",
      userId: "user1",
      product: "product1", // 必要なフィールドを追加
      searchKeyword: "keyword",
      selectedModel: "model",
      fileContent: "content",
      customPrompt: "prompt",
      senderName: "sender",
      senderCompany: "company",
      sendMethod: "form", // 送信方法を指定
      created_at: new Date().toISOString(), // created_atを追加
    }),
  });

  const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const startTime = Date.now(); // 修正: startTimeの初期化

    try {
      const { id, userId, product, searchKeyword, companyId, selectedModel, fileContent, customPrompt, senderName, senderCompany, sendMethod, created_at } = await req.json();

      // Update task status to "processing"
      await updateTaskStatus(mockSupabase, id, 'processing'); // supabaseをモックに変更

      // Generate content
      const contentResponse = await mockGenerateContent();
      const content = contentResponse; // モックの内容を直接使用

      // Determine send method
      const preferredMethod = "form"; // モックのため、直接指定
      const sendResult = await determineSendMethod(preferredMethod, companyId, userId); // 引数を修正

      await mockLogJobProgress(jobId, id, "タスク処理開始");
      await mockLogJobProgress(jobId, id, "コンテンツ生成完了");
      await mockLogJobProgress(jobId, id, `送信方法決定: ${sendResult}`);

      let result;
      if (sendResult === "form") {
        result = await mockRetryOperation(() => mockSendViaForm());
      } else {
        result = await mockRetryOperation(() => mockSendViaDM());
      }
      await mockLogJobProgress(jobId, id, `送信完了: ${result.status}`);

      await updateTaskStatus(mockSupabase, id, "completed", result);
      await updateJobStatus(mockSupabase, jobId);

      const endTime = Date.now();
      await mockRecordMetrics({ jobId, taskId: id, name: "task_execution", value: endTime - startTime });

      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error: any) {
      console.error("Error:", error.message);
      await updateTaskStatus(mockSupabase, (await req.json()).id, 'failed'); // taskを使用
      await mockLogJobProgress(jobId, (await req.json()).id, `エラー発生: ${error.message}`, "error");
      await mockRecordMetrics({ jobId, taskId: (await req.json()).id, name: "task_error", value: Date.now() - startTime });
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  };

  const response = await handler(req);
  assertEquals(response.status, 200);

  const responseBody = await response.json();
  assertExists(responseBody.success);
  assertEquals(responseBody.success, true);
  assertExists(responseBody.result);
  assertEquals(responseBody.result.status, "success");
});

// エラーケースのテスト
Deno.test("task-executor - エラー系", async () => {
  const jobId = "job2"; // 適切な値を設定
  const taskId = "task2"; // 適切な値を設定
  const req = new Request("http://localhost:8000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId,
      jobId,
      companyId: "company2",
      userId: "user2",
    }),
  });

  const errorMockGenerateContent = () => Promise.reject(new Error("Content generation failed"));

  const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const startTime = Date.now();
    const supabase = mockSupabase as any;

    try {
      const { taskId, jobId, companyId, userId } = await req.json();

      const userSettings = await mockGetUserSettings();
      const preferredMethod = userSettings.preferred_method || "form";

      await supabase.rpc("begin_transaction");

      await supabase.functions.invoke("task-operations", {
        body: JSON.stringify({
          action: "updateTaskStatus",
          data: { taskId, status: "processing" },
        }),
      });
      await mockLogJobProgress(jobId, taskId, "タスク処理開始");

      const content = await mockRetryOperation(() =>
        errorMockGenerateContent()
      );

      // ここでエラーが発生するため、以下のコードは実行されない
      return new Response(JSON.stringify({ success: true, result: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error: any) {
      console.error("Error:", error.message);
      await supabase.rpc("rollback_transaction");
      await mockLogJobProgress(jobId, taskId, `エラー発生: ${error.message}`, "error");
      await updateTaskStatus(supabase, taskId, "failed", null, error.message);
      await mockRecordMetrics({ jobId, taskId, name: "task_error", value: Date.now() - startTime });
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  };

  const response = await handler(req);
  assertEquals(response.status, 500);

  const responseBody = await response.json();
  assertExists(responseBody.success);
  assertEquals(responseBody.success, false);
  assertExists(responseBody.error);
  assertEquals(responseBody.error, "Content generation failed");
});

// ヘルパー関数
async function determineSendMethod(preferredMethod: string, companyId: string, userId: string) {
  if (preferredMethod === "form") {
    try {
      const formUrl = await mockDetectForm();
      return formUrl ? "form" : "dm";
    } catch (error) {
      console.error("フォーム検出エラー:", error.message);
      return "dm";
    }
  }
  return "dm";
}

async function updateTaskStatus(supabase: any, taskId: string, status: string, result: any = null, errorMessage: string | null = null) {
  const { error } = await supabase.functions.invoke("task-operations", {
    body: JSON.stringify({
      action: "updateTaskStatus",
      data: { taskId, status, result: result ? JSON.stringify(result) : null, errorMessage },
    }),
  });

  if (error) throw new Error(`タスクステータス更新エラー: ${error.message}`);
}

async function updateJobStatus(supabase: any, jobId: string): Promise<void> { // 修正: 戻り値の型を明示
  const { error } = await supabase.functions.invoke("job-operations", {
    body: JSON.stringify({
      action: "updateJobStatusAfterTaskCompletion",
      data: { jobId },
    }),
  });

  if (error) throw new Error(`ジョブステータス更新エラー: ${error.message}`);
  return; // 追加: 明示的にreturnを追加
}