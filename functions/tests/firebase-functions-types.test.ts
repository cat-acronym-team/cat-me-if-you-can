import { isLobbyRequest, isStalkChatroomRequest } from "../src/firebase-functions-types";

import { expect } from "chai";

describe("isLobbyRequest", () => {
  it("should allow valid lobby request", () => {
    const data = {
      code: "123456",
    };

    expect(isLobbyRequest(data)).to.be.true;
  });

  it("should not allow if code is a number", () => {
    const data = {
      code: 123456,
    };

    expect(isLobbyRequest(data)).to.be.false;
  });

  it("should not allow if data is an empty object", () => {
    const data = {};

    expect(isLobbyRequest(data)).to.be.false;
  });

  it("should not allow if data is null", () => {
    const data = null;

    expect(isLobbyRequest(data)).to.be.false;
  });

  it("should not allow if data is undefined", () => {
    const data = undefined;

    expect(isLobbyRequest(data)).to.be.false;
  });

  it("should not allow if data is a string", () => {
    const data = "123456";

    expect(isLobbyRequest(data)).to.be.false;
  });
});

describe("isStalkChatroomRequest", () => {
  it("should allow valid stalk chatroom request", () => {
    const data = {
      code: "123456",
      chatId: "123456",
    };

    expect(isStalkChatroomRequest(data)).to.be.true;
  });

  it("should NOT allow if null", () => {
    const data = null;

    expect(isStalkChatroomRequest(data)).to.be.false;
  });

  it("should NOT allow if undefined", () => {
    const data = undefined;

    expect(isStalkChatroomRequest(data)).to.be.false;
  });

  it("should NOT allow if string", () => {
    const data = "adf82nuv";

    expect(isStalkChatroomRequest(data)).to.be.false;
  });

  it("should NOT allow if data is an empty object", () => {
    const data = {};

    expect(isStalkChatroomRequest(data)).to.be.false;
  });

  it("should NOT allow if code is a number", () => {
    const data = {
      code: 123456,
    };

    expect(isStalkChatroomRequest(data)).to.be.false;
  });
});
