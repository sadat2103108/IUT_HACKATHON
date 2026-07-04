import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "node:http";
import { dispatchDiscordAlert } from "./discord/alertService.js";
import { initializeDiscord } from "./discord/index.js";
import { registerMonitoringRoutes } from "./routes/monitoringRoutes.js";
import { createMonitoringService } from "./services/monitoringService.js";
import { initializeMonitoringSocket } from "./socket/monitoringSocket.js";

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  const service = createMonitoringService({ notifier: dispatchDiscordAlert });
  registerMonitoringRoutes(app, service);
  initializeMonitoringSocket(server, service);

  const port = Number(process.env.PORT || 4000);

  await initializeDiscord();

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the previous server instance and try again.`);
      process.exit(1);
    } else {
      console.error('Server startup error:', error);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    console.log(`Office monitoring server ready on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Server failed to start:", error);
});