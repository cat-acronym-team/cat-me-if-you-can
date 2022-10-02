import { displayNameValidator } from "../../src/firestore-types/users";

import { expect } from "chai";

describe("displayNameValidator", () => {
  it("should allow normal name", () => {
    const name = "Catniss";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should allow 3 character names", () => {
    const name = "Bob";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow empty names", () => {
    const name = "";

    const expectedValidationResult = {
      valid: false,
      reason: "Display name must be at least 3 characters long",
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow names with less than three letters", () => {
    const name = "ab";

    const expectedValidationResult = {
      valid: false,
      reason: "Display name must be at least 3 characters long",
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should allow 15 character names", () => {
    const name = "Fifteen loooong";

    const expectedValidationResult = {
      valid: true,
    };
    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow 16 character names", () => {
    const name = "Sixteen looooong";

    const expectedValidationResult = {
      valid: false,
      reason: "Display name must be at most 15 characters long",
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow names that end with a space", () => {
    const name = "space at end ";

    const expectedValidationResult = {
      valid: false,
      reason: "Display name must not contain leading or trailing whitespace",
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should not allow names that start with a space", () => {
    const name = " space at start";

    const expectedValidationResult = {
      valid: false,
      reason: "Display name must not contain leading or trailing whitespace",
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });

  it("should allow names with emoji", () => {
    const name = "Cat Emoji 😸";

    const expectedValidationResult = {
      valid: true,
    };

    const actualValidationResult = displayNameValidator(name);

    expect(actualValidationResult).to.deep.equal(expectedValidationResult);
  });
});
