"use client";

// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import {
  Strategy,
  ToneOfVoice,
  ContentFocus,
  isValidStrategy,
  isValidTone,
  isValidFocus,
} from '../_shared/types.ts';

type ExecutionPriority = 'speed' | 'balanced' | 'quality';
type PreferredMethod = 'FORM' | 'EMAIL' | 'HYBRID';
type EvaluationPeriod = '24h' | '7d' | '30d' | '90d';

interface TemplateMetric {
  id: string;
  name: string;
  type: 'system' | 'custom';
  unit: string;
  target: number;
  weight: number;
}

interface TemplateSettings {
  mode: 'ai_auto' | 'manual';
  strategy: Strategy;
  tone_of_voice: ToneOfVoice;
  max_length: number;
  use_emoji: boolean;
  execution_priority: ExecutionPriority;
  metrics: TemplateMetric[];
  evaluation_period: EvaluationPeriod;
  parallel_tasks: number;
  retry_attempts: number;
  preferred_method: PreferredMethod;
}

interface TemplateData {
  name: string;
  content: string;
  category: string;
  userId: string;
  settings: TemplateSettings;
}

interface UpdateTemplateData {
  id: string;
  userId: string;
  name?: string;
  content?: string;
  category?: string;
  settings?: Partial<TemplateSettings>;
}

function validateTemplateSettings(settings: TemplateSettings) {
  // モードの検証
  if (settings.mode !== 'ai_auto' && settings.mode !== 'manual') {
    throw new Error(`Invalid mode: ${settings.mode}. Must be either 'ai_auto' or 'manual'`);
  }

  // 戦略の検証
  if (!isValidStrategy(settings.strategy)) {
    throw new Error(`Invalid strategy: ${settings.strategy}`);
  }

  // トーンの検証
  if (!isValidTone(settings.tone_of_voice)) {
    throw new Error(`Invalid tone of voice: ${settings.tone_of_voice}`);
  }

  // 実行優先度の検証
  if (!['speed', 'balanced', 'quality'].includes(settings.execution_priority)) {
    throw new Error(`Invalid execution priority: ${settings.execution_priority}`);
  }

  // 評価期間の検証
  if (!['24h', '7d', '30d', '90d'].includes(settings.evaluation_period)) {
    throw new Error(`Invalid evaluation period: ${settings.evaluation_period}`);
  }

  // メトリクスの検証
  if (!Array.isArray(settings.metrics)) {
    throw new Error('Metrics must be an array');
  }

  settings.metrics.forEach((metric, index) => {
    if (!metric.id || !metric.name || !metric.type || !metric.unit) {
      throw new Error(`Invalid metric at index ${index}: Missing required fields`);
    }
    if (!['system', 'custom'].includes(metric.type)) {
      throw new Error(`Invalid metric type at index ${index}: ${metric.type}`);
    }
  });
}

async function handleTemplateAction(action: string, data: any) {
  switch (action) {
    case 'createTemplate':
      return await createTemplate(data);
    case 'updateTemplate':
      return await updateTemplate(data);
    case 'fetchTemplate':
      return await fetchTemplate(data.id, data.userId);
    case 'fetchTemplates':
      return await fetchTemplates(data);
    case 'deleteTemplate':
      return await deleteTemplate(data.id, data.userId);
    case 'archiveTemplate':
      return await archiveTemplate(data.id, data.userId);
    case 'duplicateTemplate':
      return await duplicateTemplate(data.id, data.userId);
    case 'batchOperation':
      return await handleBatchOperation(data);
    default:
      throw new Error(`不明なテンプレートアクション: ${action}`);
  }
}

async function validateTemplateData(data: Partial<TemplateData>) {
  if (!data.name?.trim()) {
    throw new Error('テンプレート名は必須です');
  }

  if (!data.category?.trim()) {
    throw new Error('カテゴリは必須です');
  }

  if (!data.content?.trim()) {
    throw new Error('コンテンツは必須です');
  }

  if (!data.userId?.trim()) {
    throw new Error('ユーザーIDは必須です');
  }
}

async function createTemplate(data: any) {
  try {
    console.log('Received template data:', data);
    const content = JSON.parse(data.content);
    console.log('Parsed content:', content);

    // contentの型チェック
    if (!content || typeof content !== 'object') {
      throw new Error('Invalid template content format');
    }

    if (!content.strategy || !content.execution || !content.kpi) {
      throw new Error('Missing required template content fields');
    }

    // 評価期間を適切な形式に変換
    let evaluationPeriod: EvaluationPeriod = '30d'; // デフォルト値
    if (content.kpi.evaluationPeriod === 1) {
      evaluationPeriod = '24h';
    } else if (content.kpi.evaluationPeriod === 7) {
      evaluationPeriod = '7d';
    } else if (content.kpi.evaluationPeriod === 30) {
      evaluationPeriod = '30d';
    } else if (content.kpi.evaluationPeriod === 90) {
      evaluationPeriod = '90d';
    }

    // 戦略設定の検証
    if (
      typeof content.strategy.mode !== 'string' ||
      !['ai_auto', 'manual'].includes(content.strategy.mode) ||
      typeof content.strategy.strategy !== 'string' ||
      typeof content.strategy.toneOfVoice !== 'string' ||
      typeof content.strategy.maxLength !== 'number' ||
      typeof content.strategy.useEmoji !== 'boolean'
    ) {
      throw new Error('Invalid strategy settings');
    }

    // 実行設定の検証
    if (
      typeof content.execution.execution_priority !== 'string' ||
      !['speed', 'balanced', 'quality'].includes(content.execution.execution_priority)
    ) {
      throw new Error('Invalid execution settings');
    }

    const templateData: TemplateData = {
      name: data.name,
      content: JSON.stringify({
        basicInfo: content.basicInfo || {},
        strategy: {
          mode: content.strategy.mode,
          strategy: content.strategy.strategy,
          toneOfVoice: content.strategy.toneOfVoice,
          maxLength: content.strategy.maxLength,
          useEmoji: content.strategy.useEmoji,
          contentFocus: content.strategy.contentFocus,
          customInstructions: content.strategy.customInstructions,
          messageTemplate: content.strategy.messageTemplate
        },
        execution: {
          execution_priority: content.execution.execution_priority,
          parallel_tasks: content.execution.parallel_tasks || 5,
          retry_attempts: content.execution.retry_attempts || 3,
          preferred_method: content.execution.preferred_method || 'FORM'
        },
        kpi: {
          metrics: content.kpi.metrics || [],
          evaluationPeriod: content.kpi.evaluationPeriod
        }
      }),
      category: data.category,
      userId: data.userId,
      settings: {
        mode: content.strategy.mode,
        strategy: content.strategy.strategy,
        tone_of_voice: content.strategy.toneOfVoice,
        max_length: content.strategy.maxLength,
        use_emoji: content.strategy.useEmoji,
        execution_priority: content.execution.execution_priority,
        metrics: content.kpi.metrics,
        evaluation_period: evaluationPeriod,
        parallel_tasks: content.execution.parallel_tasks || 5,
        retry_attempts: content.execution.retry_attempts || 3,
        preferred_method: content.execution.preferred_method || 'FORM'
      }
    };

    console.log('Converted template data:', templateData);

    await validateTemplateData(templateData);
    validateTemplateSettings(templateData.settings);

    const template = {
      name: templateData.name.trim(),
      content: templateData.content,
      category: templateData.category,
      user_id: templateData.userId,
      settings: templateData.settings,
      created_at: new Date().toISOString(),
    };

    console.log('Final template data for insertion:', template);

    const { data: createdTemplate, error } = await supabase
      .from('job_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    console.log('Created template:', createdTemplate);
    return { data: createdTemplate };
  } catch (error) {
    console.error('Error in createTemplate:', error);
    throw error;
  }
}

async function updateTemplate(data: UpdateTemplateData) {
  const { id, userId, settings, ...updates } = data;
  
  if (!id) {
    throw new Error('テンプレートIDは必須です');
  }

  // 既存のテンプレートを取得
  const { data: existingTemplate, error: fetchError } = await supabase
    .from('job_templates')
    .select('settings')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // 更新データの作成（既存の設定とマージ）
  const updatedSettings = settings ? {
    ...existingTemplate.settings,
    ...settings,
    // 部分的な更新の場合でも必須フィールドを保持
    mode: settings.mode || existingTemplate.settings.mode,
    strategy: settings.strategy || existingTemplate.settings.strategy,
    tone_of_voice: settings.tone_of_voice || existingTemplate.settings.tone_of_voice,
    max_length: settings.max_length || existingTemplate.settings.max_length,
    use_emoji: settings.use_emoji ?? existingTemplate.settings.use_emoji,
    execution_priority: settings.execution_priority || existingTemplate.settings.execution_priority,
    metrics: settings.metrics || existingTemplate.settings.metrics,
    evaluation_period: settings.evaluation_period || existingTemplate.settings.evaluation_period,
    parallel_tasks: settings.parallel_tasks || existingTemplate.settings.parallel_tasks,
    retry_attempts: settings.retry_attempts ?? existingTemplate.settings.retry_attempts,
    preferred_method: settings.preferred_method || existingTemplate.settings.preferred_method
  } : existingTemplate.settings;

  // 更新された設定のバリデーション
  validateTemplateSettings(updatedSettings);

  const templateUpdates = {
    ...(updates.name && { name: updates.name.trim() }),
    ...(updates.content && { content: updates.content }),
    ...(updates.category && { category: updates.category }),
    settings: updatedSettings,
    updated_at: new Date().toISOString()
  };

  const { data: updatedTemplate, error } = await supabase
    .from('job_templates')
    .update(templateUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return { data: updatedTemplate };
}

async function fetchTemplate(id: string, userId: string) {
  if (!id) {
    throw new Error('テンプレートIDは必須です');
  }

  const { data: template, error } = await supabase
    .from('job_templates')
    .select(`
      id,
      name,
      content,
      category,
      settings,
      created_at,
      updated_at,
      user_id
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // データ構造を変換
  const formattedTemplate = {
    id: template.id,
    name: template.name,
    content: template.content,
    category: template.category,
    mode: template.settings?.mode || 'manual',
    strategy: template.settings?.strategy || 'benefit-first',
    toneOfVoice: template.settings?.tone_of_voice || 'professional',
    maxLength: template.settings?.max_length || 500,
    useEmoji: template.settings?.use_emoji || false,
    execution_priority: template.settings?.execution_priority || 'balanced',
    metrics: template.settings?.metrics || [],
    evaluationPeriod: template.settings?.evaluation_period || '30d',
    parallel_tasks: template.settings?.parallel_tasks || 5,
    retry_attempts: template.settings?.retry_attempts || 3,
    preferred_method: template.settings?.preferred_method || 'FORM',
    created_at: template.created_at,
    updated_at: template.updated_at,
    user_id: template.user_id
  };

  return { data: formattedTemplate };
}

async function deleteTemplate(id: string, userId: string) {
  if (!id) {
    throw new Error('テンプレートIDは必須です');
  }

  const { error } = await supabase
    .from('job_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

async function archiveTemplate(id: string, userId: string) {
  if (!id) {
    throw new Error('テンプレートIDは必須です');
  }

  const { data: template, error: fetchError } = await supabase
    .from('job_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from('job_templates')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return { success: true };
}

async function duplicateTemplate(id: string, userId: string) {
  if (!id) {
    throw new Error('テンプレートIDは必須です');
  }

  // 元のテンプレートを取得
  const { data: sourceTemplate, error: fetchError } = await supabase
    .from('job_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // 新しいテンプレートを作成
  const newTemplate = {
    ...sourceTemplate,
    id: undefined, // 新しいIDが自動生成されるように
    name: `${sourceTemplate.name} (コピー)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null
  };

  const { data: createdTemplate, error: createError } = await supabase
    .from('job_templates')
    .insert(newTemplate)
    .select()
    .single();

  if (createError) throw createError;

  return { data: createdTemplate };
}

interface BatchOperationData {
  operation: 'archive' | 'delete';
  templateIds: string[];
  userId: string;
}

async function handleBatchOperation(data: BatchOperationData) {
  const { operation, templateIds, userId } = data;

  if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
    throw new Error('テンプレートIDのリストは必須です');
  }

  switch (operation) {
    case 'archive':
      const { error: archiveError } = await supabase
        .from('job_templates')
        .update({ archived_at: new Date().toISOString() })
        .in('id', templateIds)
        .eq('user_id', userId);

      if (archiveError) throw archiveError;
      break;

    case 'delete':
      const { error: deleteError } = await supabase
        .from('job_templates')
        .delete()
        .in('id', templateIds)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      break;

    default:
      throw new Error(`不明な一括操作: ${operation}`);
  }

  return { success: true };
}

// テンプレートの型定義
interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  user_id: string;
  settings: TemplateSettings;
  created_at: string;
  updated_at?: string;
}

interface FetchTemplatesParams {
  userId: string;
  searchTerm?: string;
  category?: string;
}

async function fetchTemplates(params: FetchTemplatesParams) {
  const { userId, searchTerm, category } = params;

  let query = supabase
    .from('job_templates')
    .select(`
      id,
      name,
      content,
      category,
      settings,
      created_at,
      updated_at,
      user_id
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: templates, error, count } = await query;

  if (error) throw error;

  // データ構造を変換
  const formattedTemplates = templates?.map(template => ({
    id: template.id,
    name: template.name,
    content: template.content,
    category: template.category,
    mode: template.settings?.mode || 'manual',
    strategy: template.settings?.strategy || 'benefit-first',
    toneOfVoice: template.settings?.tone_of_voice || 'professional',
    maxLength: template.settings?.max_length || 500,
    useEmoji: template.settings?.use_emoji || false,
    execution_priority: template.settings?.execution_priority || 'balanced',
    metrics: template.settings?.metrics || [],
    evaluationPeriod: template.settings?.evaluation_period || '30d',
    parallel_tasks: template.settings?.parallel_tasks || 5,
    retry_attempts: template.settings?.retry_attempts || 3,
    preferred_method: template.settings?.preferred_method || 'FORM',
    created_at: template.created_at,
    updated_at: template.updated_at,
    user_id: template.user_id
  })) || [];

  return { data: formattedTemplates, count };
}

// リクエストハンドラー
serve(async (req) => {
  // プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // リクエストボディの解析
    const { action, data } = await req.json();
    console.log('Received request:', { action, data });

    // アクションの実行
    const result = await handleTemplateAction(action, data);
    
    // 成功レスポンス
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    // エラーログ
    console.error('Error in template operation:', error);
    
    // エラーレスポンス
    const errorMessage = error instanceof Error ? error.message : 'テンプレート操作中にエラーが発生しました';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});