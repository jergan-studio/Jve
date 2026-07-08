// Jve/server/index.js
const express = require("express");
const api = require("./api");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use("/jve", api);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Jve API listening on :${port}`);
});
