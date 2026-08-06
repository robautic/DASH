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
  const { fetchAttendants, fetchInstances } = await import("../services/datacrazy/agents");
  const { fetchAllLeads, fetchAllBusinesses, fetchPipelineStages } = await import("../services/datacrazy/leads");
  const { fetchAllConversations } = await import("../services/datacrazy/conversations");
  const { fetchDepartments } = await import("../services/datacrazy/departments");

  const pause = () => new Promise((r) => setTimeout(r, 200));

  try {
    const attendants = await fetchAttendants().catch(() => ({ data: [] }));
    await pause();
    const departments = await fetchDepartments().catch(() => ({ data: [] }));
    await pause();
    const instances = await fetchInstances().catch(() => ({ data: [] }));
    await pause();
    const stages = await fetchPipelineStages(PIPELINE_VALUE_ID).catch(() => ({ data: [] }));
    await pause();
    const leads = await fetchAllLeads().catch(() => ({ data: [] }));
    await pause();
    const businesses = await fetchAllBusinesses().catch(() => ({ data: [] }));
    await pause();
    const conversations = await fetchAllConversations().catch(() => ({ data: [] }));

    const dashboardData = {
      attendants: attendants.data || [],
      leads: leads.data || [],
      instances: instances.data || [],
      businesses: businesses.data || [],
      stages: stages.data || [],
      conversations: conversations.data || [],
      departments: departments.data || [],
    };

    setCache("dashboard", dashboardData);
    console.log(`[Cache] Dashboard data refreshed: ${dashboardData.leads.length} leads, ${dashboardData.businesses.length} businesses, ${dashboardData.conversations.length} conversations`);
    return dashboardData;
  } catch (error) {
    console.error("[Cache] Failed to refresh dashboard data:", error);
    return getCache("dashboard");
  }
}

// Auto-refresh every 5 minutes to respect DataCrazy API rate limits
setInterval(() => {
  refreshDashboardData().catch(console.error);
}, 300_000);

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
