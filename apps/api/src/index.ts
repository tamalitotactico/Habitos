import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { habitRouter } from "./routes/habit.routes";
import { habitLogRouter } from "./routes/habitLog.routes";
import { timeEntryRouter } from "./routes/timeEntry.routes";
import { insightRouter } from "./routes/insight.routes";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/habits", habitRouter);
app.use("/habit-logs", habitLogRouter);
app.use("/time-entries", timeEntryRouter);
app.use("/insights", insightRouter);

// Centralised error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

export default app;
