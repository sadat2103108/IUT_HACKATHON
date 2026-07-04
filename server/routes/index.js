import { getHealth } from "../controllers/healthController.js";

export function registerRoutes() {
  console.log("Routes registered");
  console.log("GET /health ->", getHealth());
}