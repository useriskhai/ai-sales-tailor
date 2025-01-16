export async function retryOperation(operation: () => Promise<any>, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Operation failed, retrying (${attempt + 1}/${retries})...`, error);
    }
  }
  throw lastError;
}