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
};

export function displayNameValidator(displayName: string): { valid: true } | { valid: false; reason: string } {
  if (displayName.length < 3) {
    return { valid: false, reason: "Display name must be at least 3 characters long" };
  }

  if (displayName.length > 12) {
    return { valid: false, reason: "Display name must be at most 12 characters long" };
  }

  if (displayName !== displayName.trim()) {
    return { valid: false, reason: "Display name must not contain leading or trailing whitespace" };
  }

  return { valid: true };
}
