/**
 * formats a number of seconds as seconds and minutes
 * @param seconds th number of seconds left on the timer
 * @returns a string of the form "mm:ss"
 */
export function formatTimer(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;
  return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
}
