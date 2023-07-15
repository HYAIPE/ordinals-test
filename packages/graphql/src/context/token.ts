export type TokenType = "bitcoin" | "ethereum";

export interface ITokenContext {
  getToken: () => string | undefined;
  setToken: (token: string) => void;
  clearToken: () => void;
}
