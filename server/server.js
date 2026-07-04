import { registerRoutes } from "./routes/index.js";
import { initializeSocket } from "./socket/index.js";
import { initializeDiscord } from "./discord/index.js";

const PORT = process.env.PORT || 3000;

function bootstrap() {
  console.log("Server starting...");

  registerRoutes();
  initializeSocket();
  initializeDiscord();

  console.log(`Server placeholder ready on port ${PORT}`);
}

bootstrap();