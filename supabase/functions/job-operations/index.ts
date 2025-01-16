import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { BatchJob, BatchJobStatus } from '../_shared/types.ts';

export async function handleJobAction(action: string, data: any) {
  switch (action) {
    case 'createJob':
      return await createJob(data);
    case 'startJob':
      return await startJob(data.jobId);
    case 'pauseJob':
      return await pauseJob(data.jobId);
    case 'resumeJob':
      return await resumeJob(data.jobId);
    case 'fetchJobHistory':
      return await fetchJobHistory(data.page, data.pageSize, data.sortField, data.sortOrder, data.filterStatus);
    case 'updateBatchJob':
      return await updateBatchJob(data.jobId, data.updates);
    case 'getJobInfo':
      return await getJobInfo(data.jobId);
    case 'deleteJob':
      return await deleteJob(data.jobId);
    case 'fetchJobLogs':
      return await fetchJobLogs(data.jobId);
    case 'fetchJobTasks':
      return await fetchJobTasks(data.jobId);
    case 'updateJobStatus':
      return await updateJobStatus(data.jobId, data.status, data.errorMessage);
    default:
      throw new Error(`不明なジョブアクション: ${action}`);
  }
}

async function createJob(jobData: Partial<BatchJob>) {
  console.log('Creating job with data:', jobData);

  if (!jobData.product_id) throw new Error('product_id is required');
  if (!jobData.sending_group_id) throw new Error('sending_group_id is required');
  if (!jobData.user_id) throw new Error('user_id is required');

  const job = {
    product_id: jobData.product_id,
    sending_group_id: jobData.sending_group_id,
    user_id: jobData.user_id,
    status: BatchJobStatus.PENDING,
    preferred_method: jobData.preferred_method || 'FORM',
    parallel_tasks: jobData.parallel_tasks || 5,
    retry_attempts: jobData.retry_attempts || 3,
    completed_tasks: 0,
    total_tasks: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    content_directives: jobData.content_directives || '',
  };

  const { data, error } = await supabase
    .from('batch_jobs')
    .insert(job)
    .select()
    .single();

  if (error) {
    console.error('Job creation error:', error);
    throw error;
  }

  return { jobId: data.id };
}

async function startJob(jobId: string) {
  const { data, error } = await supabase
    .from('batch_jobs')
    .update({ 
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function fetchJobHistory(
  page: number = 1, 
  pageSize: number = 10, 
  sortField: string = 'created_at', 
  sortOrder: 'asc' | 'desc' = 'desc',
  filterStatus: string | null = null
) {
  let query = supabase
    .from('batch_jobs')
    .select('*', { count: 'exact' });

  if (filterStatus) {
    query = query.eq('status', filterStatus);
  }

  const { data, error, count } = await query
    .order(sortField, { ascending: sortOrder === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;
  return { data, totalCount: count };
}

async function fetchJobLogs(jobId: string) {
  const { data, error } = await supabase
    .from('job_logs')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Job logs fetch error:', error);
    throw error;
  }

  return data;
}

async function fetchJobTasks(jobId: string) {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('batch_job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Job tasks fetch error:', error);
    throw error;
  }

  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const bodyText = await req.text();
      console.log('Received request body:', bodyText);

      const parsedData = JSON.parse(bodyText);
      const { action, data } = parsedData;

      console.log('Processing action:', action, 'with data:', data);

      const result = await handleJobAction(action, data);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      console.error('Error processing request:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 405,
  });
});