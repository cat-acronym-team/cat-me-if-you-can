/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { build } from "$service-worker";

const CACHE = "cat-me-if-you-can";

const ASSETS = [...build, "/offline", "/favicon.ico", "/favicon.png", "/images/banner.webp"];

self.addEventListener("install", (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    const cache = await caches.open(CACHE);
    const keys = await cache.keys();
    for (const key of keys) {
      const url = new URL(key.url);
      if (!ASSETS.includes(url.pathname)) {
        await cache.delete(key);
      }
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
  // ignore POST requests etc
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  async function respondToNavigation(): Promise<Response> {
    // If this is a navigation request, try the network first, or show offline page
    try {
      return await fetch(event.request);
    } catch {
      const cache = await caches.open(CACHE);
      return cache.match("/offline") as Promise<Response>;
    }
  }

  async function respondToAsset(): Promise<Response> {
    const cache = await caches.open(CACHE);
    return cache.match(event.request) as Promise<Response>;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(respondToNavigation());
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith(respondToAsset());
  }
});
