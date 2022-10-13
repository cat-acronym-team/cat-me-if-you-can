import { avatarCheck } from "../../src/function-types/avatar";

import { expect } from "chai";

describe("avatarCheck", () => {
  it("should return true for a valid ChangeAvatarData", () => {
    const returnedValue = avatarCheck({ avatar: 5, lobbyCode: "123456" });
    expect(returnedValue).to.be.true;
  });

  it("should return false for a number", () => {
    const returnedValue = avatarCheck(5);
    expect(returnedValue).to.be.false;
  });

  it("should return false for a string", () => {
    const returnedValue = avatarCheck("hello");
    expect(returnedValue).to.be.false;
  });

  it("should return false for null", () => {
    const returnedValue = avatarCheck(null);
    expect(returnedValue).to.be.false;
  });

  it("should return false for an empty object", () => {
    const returnedValue = avatarCheck({});
    expect(returnedValue).to.be.false;
  });

  it("should return false for an object with no avatar", () => {
    const returnedValue = avatarCheck({ lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if avatar is not a number", () => {
    const returnedValue = avatarCheck({ avatar: "hello", lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if avatar is not an integer", () => {
    const returnedValue = avatarCheck({ avatar: 5.5, lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return true if avatar is 1", () => {
    const returnedValue = avatarCheck({ avatar: 1, lobbyCode: "123456" });
    expect(returnedValue).to.be.true;
  });

  it("should return false if avatar is less than 1", () => {
    const returnedValue = avatarCheck({ avatar: 0, lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return true if avatar is 12", () => {
    const returnedValue = avatarCheck({ avatar: 12, lobbyCode: "123456" });
    expect(returnedValue).to.be.true;
  });

  it("should return false if avatar is greater than 12", () => {
    const returnedValue = avatarCheck({ avatar: 13, lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return false for an object with no lobbyCode", () => {
    const returnedValue = avatarCheck({ avatar: 5 });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is not a string", () => {
    const returnedValue = avatarCheck({ avatar: 5, lobbyCode: 123456 });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is 5 characters", () => {
    const returnedValue = avatarCheck({ avatar: 5, lobbyCode: "12345" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is 7 characters", () => {
    const returnedValue = avatarCheck({ avatar: 5, lobbyCode: "1234567" });
    expect(returnedValue).to.be.false;
  });
});
