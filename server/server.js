import "dotenv/config";
import { initializeDiscord } from "./discord/index.js";

async function bootstrap() {
  console.log("Server starting...");
  console.log("Token loaded:", Boolean(process.env.DISCORD_BOT_TOKEN));

  await initializeDiscord();

  console.log("Server ready");
}

bootstrap().catch((error) => {
  console.error("Server failed to start:", error);
});