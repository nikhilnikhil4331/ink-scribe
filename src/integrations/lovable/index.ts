// NikNote — Lovable integration removed
// All auth is now handled via AuthContext → Supabase directly
// This file is kept as a stub to prevent import errors

export const lovable = {
  auth: {
    signInWithOAuth: async () => {
      console.warn('Lovable auth is deprecated. Use AuthContext instead.');
      return { error: new Error('Use AuthContext for authentication') };
    },
  },
};
