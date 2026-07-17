export function isQaMode(): boolean {
  return typeof window !== "undefined"
    && new URLSearchParams(window.location.search).get("qa") === "1";
}
