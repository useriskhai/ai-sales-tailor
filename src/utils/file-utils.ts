export const generateStoragePath = (
  fileName: string,
  userId: string,
  productId?: string
): string => {
  const normalizedFileName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  if (productId) {
    return `${userId}/${productId}/${timestamp}_${random}_${normalizedFileName}`;
  }
  
  return `${userId}/${timestamp}_${random}_${normalizedFileName}`;
}; 