export const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === 'development';

export const useMockData = () => {
  return isDevelopment || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}; 