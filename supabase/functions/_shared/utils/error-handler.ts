/**
 * カスタムエラークラス
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * エラー処理の結果
 */
export interface ErrorHandlingResult {
  shouldRetry: boolean;
  errorCode: string;
  errorMessage: string;
}

/**
 * エラーを分析して適切な処理方法を決定
 * @param error 発生したエラー
 * @returns エラー処理の結果
 */
export function handleError(error: Error): ErrorHandlingResult {
  // ネットワークエラー
  if (error instanceof NetworkError) {
    return {
      shouldRetry: true,
      errorCode: 'NETWORK_ERROR',
      errorMessage: error.message
    };
  }
  
  // バリデーションエラー
  if (error instanceof ValidationError) {
    return {
      shouldRetry: false,
      errorCode: 'VALIDATION_ERROR',
      errorMessage: error.message
    };
  }
  
  // レート制限エラー
  if (error instanceof RateLimitError) {
    return {
      shouldRetry: true,
      errorCode: 'RATE_LIMIT_ERROR',
      errorMessage: error.message
    };
  }
  
  // 不明なエラー
  return {
    shouldRetry: true,
    errorCode: 'UNKNOWN_ERROR',
    errorMessage: error.message
  };
}

/**
 * エラーの種類を判定
 * @param error 発生したエラー
 * @returns エラーの種類に応じたカスタムエラー
 */
export function classifyError(error: unknown): Error {
  if (error instanceof Error) {
    // ネットワーク関連のエラー
    if (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('connection')
    ) {
      return new NetworkError(error.message);
    }
    
    // バリデーション関連のエラー
    if (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.message.includes('required')
    ) {
      return new ValidationError(error.message);
    }
    
    // レート制限関連のエラー
    if (
      error.message.includes('rate limit') ||
      error.message.includes('too many requests')
    ) {
      return new RateLimitError(error.message);
    }
    
    return error;
  }
  
  return new Error('Unknown error occurred');
} 