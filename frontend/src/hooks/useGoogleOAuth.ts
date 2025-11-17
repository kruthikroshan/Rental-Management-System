/**
 * Hook to check if Google OAuth is configured
 */
export const useGoogleOAuthAvailable = (): boolean => {
  return !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
};

/**
 * Get Google Client ID
 */
export const getGoogleClientId = (): string | undefined => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
};
