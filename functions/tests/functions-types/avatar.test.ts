import { isChangeAvatarData } from "../../src/functions-types/avatar";

import { expect } from "chai";

describe("isChangeAvatarData", () => {
  it("should return true for a valid ChangeAvatarData", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5, lobbyCode: "123456" });
    expect(returnedValue).to.be.true;
  });

  it("should return false for a number", () => {
    const returnedValue = isChangeAvatarData(5);
    expect(returnedValue).to.be.false;
  });

  it("should return false for a string", () => {
    const returnedValue = isChangeAvatarData("hello");
    expect(returnedValue).to.be.false;
  });

  it("should return false for null", () => {
    const returnedValue = isChangeAvatarData(null);
    expect(returnedValue).to.be.false;
  });

  it("should return false for an empty object", () => {
    const returnedValue = isChangeAvatarData({});
    expect(returnedValue).to.be.false;
  });

  it("should return false for an object with no avatar", () => {
    const returnedValue = isChangeAvatarData({ lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if avatar is not a number", () => {
    const returnedValue = isChangeAvatarData({ avatar: "hello", lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if avatar is not an integer", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5.5, lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return true if avatar is 1", () => {
    const returnedValue = isChangeAvatarData({ avatar: 1, lobbyCode: "123456" });
    expect(returnedValue).to.be.true;
  });

  it("should return false if avatar is less than 1", () => {
    const returnedValue = isChangeAvatarData({ avatar: 0, lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return true if avatar is 12", () => {
    const returnedValue = isChangeAvatarData({ avatar: 12, lobbyCode: "123456" });
    expect(returnedValue).to.be.true;
  });

  it("should return false if avatar is greater than 12", () => {
    const returnedValue = isChangeAvatarData({ avatar: 13, lobbyCode: "123456" });
    expect(returnedValue).to.be.false;
  });

  it("should return false for an object with no lobbyCode", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5 });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is not a string", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5, lobbyCode: 123456 });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is 5 characters", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5, lobbyCode: "12345" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is 7 characters", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5, lobbyCode: "1234567" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if object has extra keys", () => {
    const returnedValue = isChangeAvatarData({ avatar: 5, lobbyCode: "123456", extraKey: "extraValue" });
    expect(returnedValue).to.be.false;
  });
});
