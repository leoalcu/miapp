import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import pkg from 'pg';
const { Pool } = pkg;

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Crear tabla de sesiones manualmente
async function createSessionTable() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL not found, sessions will use MemoryStore');
    return null;
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Crear tabla de sesiones si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
    `);

    // Crear índice para expiración
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    console.log('✅ Session table created/verified');
    return pool;
  } catch (error) {
    console.error('❌ Error creating session table:', error);
    return null;
  }
}

// Configurar express-session con PostgreSQL
(async () => {
  const sessionPool = await createSessionTable();

  if (sessionPool) {
    // Usar PostgreSQL para sesiones
    const pgSession = (await import('connect-pg-simple')).default(session);
    
    app.use(
      session({
        store: new pgSession({
          pool: sessionPool,
          tableName: 'session',
          createTableIfMissing: false, // Ya la creamos manualmente
        }),
        secret: process.env.SESSION_SECRET || "kingdoms-secret-change-this-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 días
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: 'lax',
        },
      })
    );
    console.log('✅ Using PostgreSQL session store');
  } else {
    // Fallback a MemoryStore
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "kingdoms-secret-change-this-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        },
      })
    );
    console.log('⚠️ Using MemoryStore (sessions will be lost on restart)');
  }

  // Inicializar Passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();