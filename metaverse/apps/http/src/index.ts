import express from "express";
import { router } from "./routes/v1";
import client from "@repo/db";

const app = express();

// Creating router
app.use("/api/v1", router)

app.listen(process.env.PORT || 3000)