import "reflect-metadata";
import "dotenv/config";
import express from "express";
import path from "path"; // <-- পাথ মডিউল ইমপোর্ট করা হয়েছে
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { PriceController } from "./controllers/DseController";
import { GlobalErrorHandler } from "./middlewares/ErrorMiddleware";
import cors from "cors";

useContainer(Container);

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(cors());

// Create Express server with routing-controllers
const expressApp = createExpressServer({
  controllers: [PriceController],
  middlewares: [GlobalErrorHandler],
});

// Serve frontend (public folder)
// Vercel-এ কাজ করার জন্য এক্সাক্ট পাথ ব্যবহার করা হয়েছে
app.use(express.static(path.join(__dirname, '..', 'public')));

// Use the routing-controllers app as middleware in the express app
app.use(expressApp);

// =========================================
// Vercel-এর জন্য অ্যাপটি এক্সপোর্ট
// =========================================
module.exports = app;

// =========================================
// লোকাল ডেভেলপমেন্টের জন্য সার্ভার স্টার্ট
// =========================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
