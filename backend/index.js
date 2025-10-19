const express = require("express");
const path = require("node:path");
const app = express();

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const cors = require("cors");
app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/application", applicationRoutes);

app.get("/", (req, res) => {
  res.send("API is running....");
});

app.listen(3000, () => {
  console.log("lets go");
});
