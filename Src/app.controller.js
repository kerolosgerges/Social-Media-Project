import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import database_connection from "./DB/connection.js";
import cors from "cors";
import { authRoutes } from "./Modules/Auth/auth.controller.js";
import { userRoutes } from "./Modules/User/user.controller.js";
import { postRoutes } from "./Modules/Post/post.route.js";
import commentRoutes from "./Modules/Comment/comment.route.js";

dotenv.config({ path: path.resolve("Src/Config/.env.dev") });

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Basic root route
app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const bootstrapFunction = () => {
  database_connection();
  app
    .listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    })
    .on("error", (err) => {
      console.log(`something went wrong on running server  ${err}`);
    });
};

export default bootstrapFunction;
