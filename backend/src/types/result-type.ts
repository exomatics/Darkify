type Result<TOk = void, TError extends string = string> =
  | { success: true; data: TOk }
  | { success: false; reason: TError };

export { Result };
