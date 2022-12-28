export const catagories = ["animals", "food", "people", "movies"] as const;

export type Category = typeof catagories[number];

export const promptsByCategory = {} as { [category in Category]: string[] };

for (const category of catagories) {
  promptsByCategory[category] = require(`./${category}.json`);
}

export function getRandomPromptPair(): [string, string] {
  const category = catagories[Math.floor(Math.random() * catagories.length)];
  const prompts = promptsByCategory[category];
  const catPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  let catfishPrompt: string;
  do {
    catfishPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  } while (catfishPrompt === catPrompt);

  return [catPrompt, catfishPrompt];
}
