const express = require("express");

const app = express();
const Port = 5000;

// Import Routes
const pokemonRoute = require("./api/pokemon");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.use("/pokemon", pokemonRoute);

app.listen(Port, () => {
  console.log(["Info"], `Server started on port ${Port}`);
});
