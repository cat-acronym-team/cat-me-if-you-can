import assetLinks from "./assetlinks.json?raw";
import * as publicEnv from "$env/static/public";

export const prerender = true;

export const GET = () => {
  let modifiedAssetLinks = assetLinks;
  for (const [key, value] of Object.entries(publicEnv)) {
    modifiedAssetLinks = modifiedAssetLinks.replaceAll(`{${key}}`, value);
  }
  return new Response(modifiedAssetLinks);
};
