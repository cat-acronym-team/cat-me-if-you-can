import manifest from "./manifest.webmanifest?raw";
import * as publicEnv from "$env/static/public";

export const prerender = true;

export const GET = () => {
  let modifiedManifest = manifest;
  for (const [key, value] of Object.entries(publicEnv)) {
    modifiedManifest = modifiedManifest.replaceAll(`{${key}}`, value);
  }
  return new Response(modifiedManifest);
};
