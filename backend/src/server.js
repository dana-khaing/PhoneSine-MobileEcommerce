const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

// app.get("/", (req, res) => {
//   res.status(200).send('<h1>"Hello World!!!"</h1>');
// });

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/productsList.json"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Sever started on port ${PORT}`));
