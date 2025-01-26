require("dotenv").config();
const { TOKEN } = process.env;
const axios = require("axios");

export const discord_api = axios.create({
  baseURL: "https://discord.com/api/",
  timeout: 10000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Authorization",
    Authorization: `Bot ${TOKEN}`,
  },
});