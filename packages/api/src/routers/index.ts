import { protectedProcedure, publicProcedure, router } from "../index";
import { platformRouter } from "./platform";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  platform: platformRouter,
});
export type AppRouter = typeof appRouter;
