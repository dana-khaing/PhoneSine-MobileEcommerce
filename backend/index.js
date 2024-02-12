const express = require("express");
// var exphbs = require("express-handlebars");
const path = require("path");

const app = express();

// Handle Bar
// app.engine("handlebars", exphbs());
// app.set("view engine", "handlebars");

// app.get("/", (req, res) => res.render("home"));

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sever started on port ${PORT}`));
