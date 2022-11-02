import { isLobbyRequest } from "../src/firebase-functions-types";

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
