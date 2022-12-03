import { isLobbySettingsRequest } from "../../src/firebase-functions-types";

import { expect } from "chai";

describe("isChangeAvatarData", () => {
  it("should return true for a valid LobbySettingsData", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false for a number", () => {
    const returnedValue = isLobbySettingsRequest(5);
    expect(returnedValue).to.be.false;
  });

  it("should return false for a string", () => {
    const returnedValue = isLobbySettingsRequest("hello");
    expect(returnedValue).to.be.false;
  });

  it("should return false for null", () => {
    const returnedValue = isLobbySettingsRequest(null);
    expect(returnedValue).to.be.false;
  });

  it("should return false for an empty object", () => {
    const returnedValue = isLobbySettingsRequest({});
    expect(returnedValue).to.be.false;
  });

  it("should return false for an object with no lobbyCode", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is not a string", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: 123456,
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is 5 characters", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "12345",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbyCode is 7 characters", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "1234567",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if there is no lobbySettings Object", () => {
    const returnedValue = isLobbySettingsRequest({ lobbyCode: "1234567" });
    expect(returnedValue).to.be.false;
  });

  it("should return false if catfishAmount is not a number", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: "hello", promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if catfishAmount is not an integer", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2.2, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if catfishAmount is 1", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 1, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if catfishAmount is less than 1", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 0, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if catfishAmount is 3", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 3, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if catfishAmount is greater than 3", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 4, promptTime: 80, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if promptTime is not a number", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: "hello", chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if promptTime is not an integer", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 60.5, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if promptTime is 30", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 30, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if promptTime is less than 30", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 29, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if promptTime is 120", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 120, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if promptTime is greater than 120", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 121, chatTime: 80, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if chatTime is not a number", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: "hello", voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if chatTime is not an integer", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 60.5, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if chatTime is 60", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 60, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if chatTime is less than 60", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 59, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if chatTime is 300", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 300, voteTime: 80 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if chatTime is greater than 300", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 300, voteTime: 80 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if voteTime is not a number", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: "hello" },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if voteTime is not an integer", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 60.5 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if voteTime is 60", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 60 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if voteTime is less than 60", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 60 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return true if voteTime is 300", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 300 },
    });
    expect(returnedValue).to.be.true;
  });

  it("should return false if voteTime is greater than 300", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 80, chatTime: 80, voteTime: 300 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbySettings object has too few keys", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 60, chatTime: 60 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if lobbySettings object has extra keys", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 60, chatTime: 60, voteTime: 60, extraKey: 50 },
    });
    expect(returnedValue).to.be.false;
  });

  it("should return false if object has extra keys", () => {
    const returnedValue = isLobbySettingsRequest({
      lobbyCode: "123456",
      lobbySettings: { catfishAmount: 2, promptTime: 60, chatTime: 60, voteTime: 60 },
      extraKey: 60,
    });
    expect(returnedValue).to.be.false;
  });
});
