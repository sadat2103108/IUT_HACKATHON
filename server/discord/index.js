import { initializeBot } from "../bot/index.js";

export async function initializeDiscord() {
  console.log("Initializing Discord...");
  await initializeBot();
}