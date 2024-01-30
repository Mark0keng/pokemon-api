const Router = require("express").Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { baseURL } = require("../constant");
const { log } = require("console");

const dbPath = path.join(__dirname, "../db.json");

function isPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i < n; i++) if (n % i == 0) return false;

  return true;
}

function getFibonacci(num) {
  let sequence = [];
  let n1 = 0,
    n2 = 1,
    nextTerm;

  // if (num === 0) {
  //   sequence.push(0);
  //   return sequence;
  // }

  for (let i = 0; i <= num; i++) {
    // console.log(n1);
    sequence.push(n1);
    nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
  }

  return sequence[num];
}

const getMyPokemon = async (req, res) => {
  try {
    const data = fs.readFileSync(dbPath);
    const jsonData = JSON.parse(data);

    return res
      .status(200)
      .json({ message: "Successful get my pokemon", data: jsonData });
  } catch (error) {}
};

const getDetailPokemon = async (req, res) => {
  try {
    const id = req.params.id;
    const data = fs.readFileSync(dbPath);
    const jsonData = JSON.parse(data);

    const response = jsonData?.pokemon?.filter((pokemon) => {
      return pokemon.id === Number(id);
    });

    if (response.length === 0)
      return res.status(404).json({ message: "Pokemon not found!" });

    return res
      .status(200)
      .json({ message: "Successful get detail pokemon", data: response });
  } catch (error) {}
};

const catchPokemon = async (req, res) => {
  try {
    const name = req.params.name;
    const chance = [true, false];
    const isSuccess = Math.floor(Math.random() * chance.length);

    if (isSuccess) {
      const response = await axios.get(`${baseURL}pokemon/${name}`);
      const modifiedRes = {
        name: response.data.name,
        nickname: response.data.name,
        height: response.data.height,
        weight: response.data.weight,
      };

      const data = fs.readFileSync(dbPath);
      const jsonData = JSON.parse(data);
      const id = jsonData.pokemon.length;

      jsonData.pokemon.push({
        id,
        name: modifiedRes.name,
        nickname: modifiedRes.nickname,
        height: modifiedRes.height,
        weight: modifiedRes.weight,
      });

      fs.writeFileSync(dbPath, JSON.stringify(jsonData));

      return res
        .status(200)
        .json({ message: "Pokemon successfully catched", data: modifiedRes });
    }

    return res.status(200).json({ message: "Pokemon running away!" });
  } catch (error) {
    console.log(error);
  }
};

const releasePokemon = async (req, res) => {
  try {
    const id = req.params.id;
    const chance = Math.floor(Math.random() * 10);

    const isSuccess = isPrime(chance);

    if (isSuccess) {
      const data = fs.readFileSync(dbPath);
      const jsonData = JSON.parse(data);

      const pokemonData = jsonData?.pokemon?.filter((pokemon) => {
        return pokemon.id !== Number(id);
      });

      fs.writeFileSync(dbPath, JSON.stringify({ pokemon: pokemonData }));

      return res
        .status(200)
        .json({ message: "Pokemon successfully released", data: pokemonData });
    }

    return res.status(200).json({ message: "Pokemon failed to release!" });
  } catch (error) {
    console.log(error);
  }
};

const renamePokemon = async (req, res) => {
  const id = req.params.id;
  const nickname = req.body.nickname;

  const data = fs.readFileSync(dbPath);
  const jsonData = JSON.parse(data);

  const exceptTarget = jsonData?.pokemon.filter((pokemon) => {
    return pokemon.id !== Number(id);
  });

  const sameNick = exceptTarget.reduce((result, pokemon) => {
    if (pokemon.nickname.includes(nickname)) {
      result.push(pokemon);
    }
    return result;
  }, []);

  const countSame = sameNick.length;

  const lastSeq = getFibonacci(countSame);

  const response = jsonData?.pokemon?.map((pokemon) => {
    if (pokemon.id === Number(id)) {
      return {
        id: pokemon.id,
        name: pokemon.name,
        nickname: req.body.nickname + "-" + lastSeq,
        height: pokemon.height,
        weight: pokemon.weight,
      };
    }
    return pokemon;
  });

  fs.writeFileSync(dbPath, JSON.stringify({ pokemon: response }));

  return res.status(200).json({
    message: "Pokemon successfully renamed!",
    data: { pokemon: response },
  });
};

Router.get("/my-pokemon", getMyPokemon);
Router.get("/my-pokemon/:id", getDetailPokemon);
Router.get("/catch/:name", catchPokemon);
Router.delete("/release/:id", releasePokemon);
Router.put("/rename/:id", renamePokemon);

module.exports = Router;
