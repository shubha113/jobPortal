import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./utils/server.js";
import userRoute from "./routes/userRoute.js";
import companyRoute from "./routes/companyRoutes.js";
import jobRoute from "./routes/jobRoute.js";
import applicationRoute from "./routes/applicationRoute.js";
import ErrorMiddleware from "./Middlewares/error.js";

dotenv.config();
const app = express({});

// CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true, // Access-Control-Allow-Credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root route
app.get("/", (req, res) =>
  res.send(
    `<h1>Site is Working. Click <a href="${process.env.FRONTEND_URL}">here</a> to visit frontend.</h1>`
  )
);

const PORT = process.env.PORT || 8000;

// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

// Error middleware
app.use(ErrorMiddleware);

// Connect to DB and start server
app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running at port: ${PORT}`);
});
