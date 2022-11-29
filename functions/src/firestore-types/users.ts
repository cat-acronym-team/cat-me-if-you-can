/**
 * the type of documents `/users/{uid}`
 */
export type UserData = {
  /**
   * the name of the user that should be displayed
   */
  displayName: string;

  /**
   * the users preferred cat profile picture
   * 0: no preference
   * 1 - 12: cat picture 1 - 12
   */
  avatar: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  /**
   * amount of times won as cat
   */
  catWins: number;

  /**
   * amount of times won as catfish
   */
  catfishWins: number;

  /**
   * amount of times you played as cat
   */
  playedAsCat: number;

  /**
   * amount of times you played as catfish
   */
  playedAsCatfish: number;
};

export function displayNameValidator(displayName: string): { valid: true } | { valid: false; reason: string } {
  let newname = displayName;
  while (newname.charAt(newname.length - 1) === " ") {
    newname = newname.slice(0, -1);
  }
  displayName = newname;
  if (displayName === "") {
    return { valid: false, reason: "Display name must not be empty" };
  }
  if (displayName.length < 3) {
    return { valid: false, reason: "Display name must be at least 3 characters long" };
  }

  if (displayName.length > 12) {
    return { valid: false, reason: "Display name must be at most 12 characters long" };
  }

  if (displayName !== displayName.trim()) {
    return { valid: false, reason: "Display name must not contain leading whitespace" };
  }

  if (displayName.search(/[^A-Za-z0-9-_ ]+/) >= 0) {
    return { valid: false, reason: "Display name must not have special characters" };
  }

  return { valid: true };
}
