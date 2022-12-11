import type { Timestamp } from "firebase-admin/firestore";

export const AVATARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type Avatar = typeof AVATARS[number];

export type Player = {
  /**
   * true if the player has not bean voted out yet
   */
  alive: boolean;

  /**
   * the cat profile picture that the user has selected
   */
  avatar: Avatar;

  /**
   * the name of the user that should be displayed
   */
  displayName: string;

  /**
   * the number of players that have voted for this player
   */
  votes: number;

  /**
   * timestamp of when the the player joined the lobby
   */
  timeJoined: Timestamp;

  /**
   * the role that the player played; used at the end of the game
   */
  role?: Role;

  /**
   * the answer for their prompt
   */
  promptAnswer?: string;
};

export type LobbySettings = {
  /**
   * the number of players that will be catfish
   */
  catfishAmount: 1 | 2 | 3;

  /**
   * duration in seconds for the PROMPT game state
   */
  promptTime: number;

  /**
   * duration in seconds for the CHAT game state
   */
  chatTime: number;

  /**
   * duration in seconds for the VOTE game state
   */
  voteTime: number;
};

export type GameState = "WAIT" | "ROLE" | "PROMPT" | "CHAT" | "VOTE" | "RESULT" | "END";

export const configurableTimers = ["PROMPT", "CHAT", "VOTE"] as const;
export type ConfigurableTimer = typeof configurableTimers[number];

/**
 * the minimum duration in seconds for each game state
 */
export const GAME_STATE_DURATIONS_MIN: { [state in ConfigurableTimer]: number } = {
  PROMPT: 30,
  CHAT: 60,
  VOTE: 60,
};

/**
 * the duration in seconds for each game state
 */
export const GAME_STATE_DURATIONS_DEFAULT: { [state in GameState]: number } = {
  WAIT: 2 * 60 * 60,
  ROLE: 7,
  PROMPT: 45,
  CHAT: 2 * 60,
  VOTE: 3 * 60,
  RESULT: 7,
  END: 7,
};

/**
 * the maximum duration in seconds for each game state
 */
export const GAME_STATE_DURATIONS_MAX: { [state in ConfigurableTimer]: number } = {
  PROMPT: 2 * 60,
  CHAT: 5 * 60,
  VOTE: 5 * 60,
};

/**
 * the type of documents `/lobbies/{code}`
 */
export type Lobby = {
  /**
   * data about each player in the lobby
   */
  players: { [uid: string]: Player };

  /**
   * the current state of the game
   */
  state: GameState;

  /**
   * expiration time of the current phase with a timer
   */
  expiration: Timestamp;

  /**
   * the role that won the game
   */
  winner?: Role;

  /**
   * the uid of the player that was voted off for the round
   * @note this can be a uid, NONE, or undefined
   */
  votedOff?: string | "NONE";

  /**
   * number of people who skipped voting
   */
  skipVote: number;

  /**
   * settings that can be edited in the lobby
   */
  host: string;

  /**
   * array of uids of banned players
   */
  bannedPlayers: string[];

  /*
   * settings that can be edited in the lobby
   */
  lobbySettings: LobbySettings;
};

/**
 * the role of a player
 */
export type Role = "CAT" | "CATFISH" | "SPECTATOR";

/**
 * the type of documents `/lobbies/{code}/privatePlayers/{uid}`
 */
export type PrivatePlayer = {
  /**
   * the role of the player
   */
  role: Role;

  /**
   * states if a user is a stalker or not
   */
  stalker: boolean;

  /**
   * the prompt that the user will be shown (this varies on the role)
   */
  prompt?: string;
};

/**
 * the type of documents `/lobbies/{code}/promptAnswers/{uid}`
 */
export type PromptAnswer = {
  /**
   * the answer that the user has submitted
   */
  answer: string;
};

export function promptAnswerValidator(displayName: string): { valid: true } | { valid: false; reason: string } {
  if (displayName.length == 0) {
    return { valid: false, reason: "Prompt answer may not be empty" };
  }

  if (displayName.length > 50) {
    return { valid: false, reason: "Prompt answer must be at most 50 characters long" };
  }

  if (displayName !== displayName.trim()) {
    return { valid: false, reason: "Prompt answer must not contain leading or trailing whitespace" };
  }

  return { valid: true };
}

/**
 * the type of documents `/lobbies/{code}/votes/{uid}`
 */
export type Vote = {
  /**
   * the UID of the player or skip that the player owning this document has voted for
   */
  target: string | null;
};

/**
 * the type of documents `/lobbies/{code}/chatRooms/{chatRoomId}`
 */
export type ChatRoom = {
  /**
   * the UIDs of the pair of players chatting in this chat room
   */
  pair: [string, string];

  /**
   * the UIDs of the users that can read this chat room (stalker and spectators)
   */
  viewers: string[];
};

/**
 * the type of documents `/lobbies/{code}/chatRooms/{chatRoomId}/chatMessages/{messageId}`
 */
export type ChatMessage = {
  /**
   * the UID of the player that sent this message
   */
  sender: string;

  /**
   * the text content of the message
   */
  text: string;

  /**
   * the time when the message was sent (used for sorting)
   */
  timestamp: Timestamp;
  /**
   * checks if this is the prompt answer
   */
  isPromptAnswer?: true;
};

/**
 * the type of documents `/lobbies/{code}/chatMessages/{messageId}`
 */
export type LobbyChatMessage = ChatMessage & {
  /**
   * true if the player has not bean voted out yet
   */
  alive: boolean;
};

export function chatMessageValidator(message: string): { valid: true } | { valid: false; reason: string } {
  if (message.length == 0) {
    return { valid: false, reason: "Chat message may not be empty" };
  }

  if (message.length > 100) {
    return { valid: false, reason: "Chat message must be at most 100 characters long" };
  }

  if (message !== message.trim()) {
    return { valid: false, reason: "Chat message must not contain leading or trailing whitespace" };
  }

  return { valid: true };
}
