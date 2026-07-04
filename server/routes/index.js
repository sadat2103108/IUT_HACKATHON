import { registerLogisticsRoutes } from "./logisticsRoutes.js";

export function registerRoutes(app, service) {
  registerLogisticsRoutes(app, service);
}