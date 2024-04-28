import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";

import listingRouter from "./routes/listing.route.js";

import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());
app.use(cors({ credentials: "true" }));

app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:3000`);
});

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/listing", listingRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
