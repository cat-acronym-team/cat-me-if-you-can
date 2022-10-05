import { chatMessageValidator } from "../../src/firestore-types/lobby";

import { expect } from "chai";

describe("chatMessageValidator", () => {
  it("should allow normal sentence", () => {
    const message = "Why is spinach your favorite food?";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should allow single character messages", () => {
    const message = "a";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow empty messages", () => {
    const message = "";

    const expectedValidationResult = {
      valid: false,
      reason: "Chat message may not be empty",
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should allow 100 character messages", () => {
    const message =
      "This message is exactly 100 characters long. We use it to test that the message validator works good";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow 101 character messages", () => {
    const message =
      "This message is exactly 100 characters long. We use it to test that the message validator works good.";

    const expectedValidationResult = {
      valid: false,
      reason: "Chat message must be at most 100 characters long",
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow messages that end with a space", () => {
    const message = "This message ends with a space. ";

    const expectedValidationResult = {
      valid: false,
      reason: "Chat message must not contain leading or trailing whitespace",
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow messages that start with a space", () => {
    const message = " This message starts with a space.";

    const expectedValidationResult = {
      valid: false,
      reason: "Chat message must not contain leading or trailing whitespace",
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should allow messages with emoji", () => {
    const message = "Look at this cute cat emoji 😸";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = chatMessageValidator(message);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });
});
