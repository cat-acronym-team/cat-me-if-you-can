import type { GameState } from "./firestore-types/lobby";

export type ChangeState = { code: string; state: GameState };
export type ErrorResponse = { error?: string };
