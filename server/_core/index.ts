import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getCache, setCache } from "../cache";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

const PIPELINE_VALUE_ID = "3922b55e-f151-4fa4-ac85-9f2767272419";

async function refreshDashboardData() {
  const {
    fetchAttendants,
    fetchLeads,
    fetchInstances,
    fetchBusinesses,
    fetchPipelineStages,
    fetchConversations,
  } = await import("../datacrazy");

  try {
    const [attendants, leads, instances, businesses, stages, conversations] = await Promise.all([
      fetchAttendants(),
      fetchLeads(0, 500),
      fetchInstances(),
      fetchBusinesses(0, 500, { pipelineId: PIPELINE_VALUE_ID }),
      fetchPipelineStages(PIPELINE_VALUE_ID),
      fetchConversations(0, 200),
    ]);

    const dashboardData = {
      attendants: attendants.data || [],
      leads: leads.data || [],
      instances: instances.data || [],
      businesses: businesses.data || [],
      stages: stages.data || [],
      conversations: conversations.data || [],
    };

    setCache("dashboard", dashboardData);
    console.log("[Cache] Dashboard data refreshed successfully");
    return dashboardData;
  } catch (error) {
    console.error("[Cache] Failed to refresh dashboard data:", error);
    return getCache("dashboard");
  }
}

// Auto-refresh every 30 seconds
setInterval(() => {
  refreshDashboardData().catch(console.error);
}, 30_000);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Pre-load dashboard data on startup (used by tRPC dashboard.full procedure)
  refreshDashboardData().catch(console.error);

  // tRPC API (dashboard.full uses cached data from refreshDashboardData)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
