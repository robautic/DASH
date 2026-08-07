import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "session_token";
const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_key";

export const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1)
    }))
    .mutation(({ input, ctx }) => {
      // Dummy check for the sake of the demo, in a real app this checks Firestore or DB
      if (input.email.includes("admin") || input.email === "admin@datacrazy.com" || input.email === "valeskaTKG@gmail.com") {
        const user = {
          id: "usr-admin-1",
          name: "Valeska Souza (Admin)",
          email: input.email,
          role: "admin",
          department: "Diretoria",
          supervisorName: "-",
          status: "ativo",
          lastAccess: new Date().toISOString()
        };
        
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        
        return { success: true, user } as const;
      }
      
      throw new Error("Credenciais inválidas");
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
