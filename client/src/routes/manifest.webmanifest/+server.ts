import manifest from "./manifest.webmanifest?raw";
import { replacePublicEnvVars } from "$lib/env";

export const prerender = true;

export const GET = () => new Response(replacePublicEnvVars(manifest));
