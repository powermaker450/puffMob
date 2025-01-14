export default class AuthenticationError extends Error {
  public name = "AuthenticationError";

  constructor(message?: string) {
    super(message);
  }
}
