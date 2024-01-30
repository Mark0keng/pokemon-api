const Router = require("express").Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { baseURL } = require("../constant");

const PokemonHelper = require("../helpers/pokemonHelper");

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

  for (let i = 0; i <= num; i++) {
    sequence.push(n1);
    nextTerm = n1 + n2;
    n1 = n2;
    n2 = nextTerm;
  }

  return sequence[num];
}

const getMyPokemon = async (req, res) => {
  try {
    const response = PokemonHelper.getAllPokemon();

    return res
      .status(200)
      .json({ message: "Successful get my pokemon", data: response.pokemon });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

const getDetailPokemon = async (req, res) => {
  try {
    const id = req.params.id;

    const response = PokemonHelper.getOnePokemon(id);

    if (response.length === 0)
      return res.status(404).json({ message: "Pokemon not found!" });

    return res
      .status(200)
      .json({ message: "Successful get detail pokemon", data: response });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
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

      const { pokemon } = PokemonHelper.getAllPokemon();
      const id = pokemon[pokemon.length - 1].id + 1;

      pokemon.push({
        id,
        name: modifiedRes.name,
        nickname: modifiedRes.nickname,
        height: modifiedRes.height,
        weight: modifiedRes.weight,
      });

      fs.writeFileSync(dbPath, JSON.stringify({ pokemon }));

      return res
        .status(200)
        .json({ message: "Pokemon successfully catched", data: modifiedRes });
    }

    return res.status(200).json({ message: "Pokemon running away!" });
  } catch (error) {
    console.log(error);
    if (error.response) {
      return res
        .status(error.response.status)
        .json({ message: error.response.data });
    }

    return res.status(500).json({ message: "Something went wrong!" });
  }
};

const releasePokemon = async (req, res) => {
  try {
    const id = req.params.id;

    const pokemonExist = PokemonHelper.getOnePokemon(id);
    if (pokemonExist.length === 0)
      return res.status(404).json({ message: "Pokemon not found" });

    const chance = Math.floor(Math.random() * 10);
    const isSuccess = isPrime(chance);

    if (isSuccess) {
      const allPokemon = PokemonHelper.getAllPokemon();

      const currentPokemon = allPokemon?.pokemon?.filter(
        (pokemon) => pokemon.id !== Number(id)
      );

      fs.writeFileSync(dbPath, JSON.stringify({ pokemon: currentPokemon }));

      return res.status(200).json({
        message: "Pokemon successfully released",
        data: currentPokemon,
      });
    }

    return res.status(200).json({ message: "Pokemon failed to release!" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

const renamePokemon = async (req, res) => {
  try {
    const id = req.params.id;
    const nickname = req.body.nickname;

    const pokemonExist = PokemonHelper.getOnePokemon(id);
    if (pokemonExist.length === 0)
      return res.status(404).json({ message: "Pokemon not found" });

    const allPokemon = PokemonHelper.getAllPokemon();
    const exceptTarget = allPokemon?.pokemon.filter((pokemon) => {
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

    const response = allPokemon?.pokemon?.map((pokemon) => {
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
      data: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

Router.get("/my-pokemon", getMyPokemon);
Router.get("/my-pokemon/:id", getDetailPokemon);
Router.get("/catch/:name", catchPokemon);
Router.delete("/release/:id", releasePokemon);
Router.put("/rename/:id", renamePokemon);

module.exports = Router;
