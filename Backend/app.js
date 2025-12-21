const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
dotenv.config();
connectDb();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("hey from server");
});

app.listen(3002, () => {
  console.log("server running on port http://localhost:3002");
});
