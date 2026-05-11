import { protectedProcedure, publicProcedure, router } from "../index";
import { learningRouter } from "./learning";
import { platformRouter } from "./platform";
import { topicsRouter } from "./topics";

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
  topics: topicsRouter,
  learning: learningRouter,
});
export type AppRouter = typeof appRouter;
