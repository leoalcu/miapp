// server/routes/auth.ts
import { Router } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Configurar Passport Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "Contraseña incorrecta" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Ruta de registro
router.post("/register", async (req, res) => {
  try {
    const { username, displayName, password } = req.body;

    // Validaciones básicas
    if (!username || !displayName || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Usuario debe tener al menos 3 caracteres" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        displayName,
        password: hashedPassword,
      })
      .returning();

    // Auto-login después del registro
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al iniciar sesión" });
      }
      res.json({
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
      });
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Ruta de login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: "Error en el servidor" });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || "Credenciales inválidas" });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al iniciar sesión" });
      }
      res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      });
    });
  })(req, res, next);
});

// Ruta de logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Error al cerrar sesión" });
    }
    res.json({ message: "Sesión cerrada correctamente" });
  });
});

// Verificar sesión actual
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    });
  } else {
    res.status(401).json({ error: "No autenticado" });
  }
});

// Middleware para proteger rutas
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Autenticación requerida" });
}

export default router;