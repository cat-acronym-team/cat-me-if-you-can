import type { GameState } from "./firebase/firestore-types/lobby";

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

/**
 * whether to show timer or not
 * @note null shouldn't call a verify expiration function
 */
export const DISPLAY_TIMERS: { [state in GameState]: boolean | null } = {
  WAIT: null,
  ROLE: false,
  PROMPT: true,
  CHAT: true,
  VOTE: true,
  RESULT: false,
  END: false,
};
