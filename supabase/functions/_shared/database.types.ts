export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          url: string | null
          website_content: string | null
          last_crawled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url?: string | null
          website_content?: string | null
          last_crawled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string | null
          website_content?: string | null
          last_crawled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crawl_queue: {
        Row: {
          id: string
          company_id: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          retry_count: number
          error_message: string | null
          next_retry_at: string | null
          processing_started_at: string | null
          processing_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          retry_count?: number
          error_message?: string | null
          next_retry_at?: string | null
          processing_started_at?: string | null
          processing_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          retry_count?: number
          error_message?: string | null
          next_retry_at?: string | null
          processing_started_at?: string | null
          processing_duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      processing_metrics: {
        Row: {
          id: string
          total_processed: number
          successful: number
          failed: number
          processing_time: number
          errors: { company_id: string; error: string }[] | null
          created_at: string
        }
        Insert: {
          id?: string
          total_processed: number
          successful: number
          failed: number
          processing_time: number
          errors?: { company_id: string; error: string }[] | null
          created_at?: string
        }
        Update: {
          id?: string
          total_processed?: number
          successful?: number
          failed?: number
          processing_time?: number
          errors?: { company_id: string; error: string }[] | null
          created_at?: string
        }
      }
    }
  }
} 