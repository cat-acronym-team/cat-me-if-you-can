import * as publicEnv from "$env/static/public";

export function replacePublicEnvVars(template: string): string {
  for (const [key, value] of Object.entries(publicEnv)) {
    template = template.replaceAll(`{${key}}`, value);
  }
  return template;
}
