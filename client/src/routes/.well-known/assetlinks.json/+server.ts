import assetLinks from "./assetlinks.json?raw";
import { replacePublicEnvVars } from "$lib/env";

export const prerender = true;

export const GET = () => new Response(replacePublicEnvVars(assetLinks));
