import "reflect-metadata";
import "dotenv/config";
import express from "express";
import path from "path"; // <-- পাথ মডিউল
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

// 🔥 নতুন পরিবর্তন: process.cwd() দিয়ে Vercel-এ এক্সাক্ট রুট পাথ বের করা
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

// Create Express server with routing-controllers
const expressApp = createExpressServer({
  controllers: [PriceController],
  middlewares: [GlobalErrorHandler],
});

// API হ্যান্ডলারটি স্ট্যাটিক এর পরে বসানো হয়েছে, যেন / পাথ public ফোল্ডার থেকে লোড হয়
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
