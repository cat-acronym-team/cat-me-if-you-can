export type ChangeAvatarData = {
  /**
   * the user the avatar would like to change to
   * 1 - 12: cat avatar
   */
  avatar: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  /**
   * lobby code for the lobby which the player would like to update their avatar
   */
  lobbyCode: string;
};

export function avatarCheck(changeAvatarData: unknown): changeAvatarData is ChangeAvatarData {
  if (typeof changeAvatarData !== "object") {
    return false;
  }
  if (changeAvatarData === null) {
    return false;
  }
  if (!("avatar" in changeAvatarData)) {
    return false;
  }
  if (!("lobbyCode" in changeAvatarData)) {
    return false;
  }
  if (Object.keys(changeAvatarData).length !== 2) {
    return false;
  }
  const intArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  if (!intArr.includes((changeAvatarData as ChangeAvatarData).avatar)) {
    return false;
  }
  if (
    typeof (changeAvatarData as ChangeAvatarData).lobbyCode !== "string" ||
    (changeAvatarData as ChangeAvatarData).lobbyCode.length !== 6
  ) {
    return false;
  }
  return true;
}
