/** Error codes from detailed design §6–§10 */
export type InkErrorCode =
  | "E_JSON"
  | "E_MAGIC"
  | "E_VER"
  | "E_STROKE"
  | "E_TOOL"
  | "E_LIMIT"
  | "E_SOURCE_MISMATCH"
  | "E_SAVE"
  | "E_STORE_FOLDER"
  | "E_PTR_NO_CAPTURE"
  | "E_PTR_LOST"
  | "E_PTR_SECONDARY"
  | "E_PRESSURE_ZERO"
  | "E_PF_THROW"
  | "E_PF_EMPTY"
  | "E_CANVAS_MAX"
  | "E_NO_MD"
  | "E_RENDER"
  | "E_READ"
  | "E_SETTINGS_PATH"
  | "E_DRIFT";

const DEBUG_KEY = "pyoink-debug";

export function inkLog(code: InkErrorCode | string, detail?: unknown): void {
  try {
    const on =
      typeof localStorage !== "undefined" && localStorage.getItem(DEBUG_KEY) === "1";
    if (on || code.startsWith("E_")) {
      // eslint-disable-next-line no-console
      console.warn(`[pyoink] code=${code}`, detail ?? "");
    }
  } catch {
    /* ignore */
  }
}

export function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
