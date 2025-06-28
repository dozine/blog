export const useSession = jest.fn(() => ({
  data: { user: { name: "Test User" } },
  status: "authenticated",
}));

export const signIn = jest.fn();
export const signOut = jest.fn();
