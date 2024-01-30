const path = require("path");
const fs = require("fs");
const dbPath = path.join(__dirname, "../db.json");

const getOnePokemon = (id) => {
  const data = fs.readFileSync(dbPath);
  const jsonData = JSON.parse(data);

  const result = jsonData?.pokemon?.filter((pokemon) => {
    return pokemon.id == Number(id);
  });

  return result;
};

const getAllPokemon = () => {
  try {
    const data = fs.readFileSync(dbPath);
    const result = JSON.parse(data);

    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getOnePokemon, getAllPokemon };
