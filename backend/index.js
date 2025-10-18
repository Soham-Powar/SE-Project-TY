const express = require("express");
const path = require("node:path");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

const appRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/application", applicationRoutes);

app.listen(3000, () => {
  console.log("lets go");
});
