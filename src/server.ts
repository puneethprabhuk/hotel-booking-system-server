import express, { Application, Request, Response } from 'express';
import dotenv from "dotenv";
import cors from "cors";
import { createTables } from './database/schema';
import routes from "./routes";

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://hotel-booking-system-ui.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api", routes);

app.use('/', (req: Request, res: Response) => {
    res.send('Hotel Booking API is running...');
});

app.listen(PORT, async () => {
    console.log(`Server running on PORT: ${PORT}`);
    await createTables();
});
