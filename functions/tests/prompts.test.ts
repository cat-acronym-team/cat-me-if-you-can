import { catagories, promptsByCategory } from "../src/prompts";

import { expect } from "chai";

describe("prompts", () => {
  it("should have at least 3 questions in every category", () => {
    for (const category of catagories) {
      expect(promptsByCategory[category].length).to.be.greaterThanOrEqual(3);
    }
  });

  it("should only have prompts that start with a capital letter and end with a question mark or period", () => {
    for (const category of catagories) {
      for (const prompt of promptsByCategory[category]) {
        expect(prompt).to.match(/^[A-Z].*[?.]$/);
      }
    }
  });

  it("should not have any duplicate prompts", () => {
    for (const category of catagories) {
      const prompts = promptsByCategory[category];
      const uniquePrompts = Array.from(new Set(prompts));
      expect(prompts).to.deep.equal(uniquePrompts);
    }
  });
});
