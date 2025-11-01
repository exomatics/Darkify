type Result<TOk = void, TError extends string = string> =
  | { success: true; data: TOk }
  | { success: false; reason: TError };
interface SuccessfulResult<TOk = void> {
  success: true;
  data: TOk;
}
export { Result, SuccessfulResult };
