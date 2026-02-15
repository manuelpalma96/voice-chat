require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(cors());

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

const ROOM_PASSWORD = process.env.ROOM_PASSWORD || "password123";

if (!API_KEY || !API_SECRET) {
  throw new Error("LIVEKIT_API_KEY y LIVEKIT_API_SECRET son requeridos");
}

app.get("/token", async (req, res) => {
  const { username, password } = req.query;
  const room = req.query.room || "sala1";

  if (password !== ROOM_PASSWORD) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  if (!username) {
    return res.status(400).json({ error: "Nombre de usuario es requerido" });
  }

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: username,
    ttl: '10m',
    nbf: Math.floor(Date.now() / 1000) - 60,
  });

  at.addGrant({ roomJoin: true, room });

  const token = await at.toJwt();
  res.json({ token });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (API_KEY && API_SECRET) {
    console.log(`Backend listo en ${port}. API Key cargada: ${API_KEY.substring(0, 4)}..., Longitud del Secret: ${API_SECRET.length}`);
  } else {
    console.log("Error: No se encontraron las variables de entorno LIVEKIT_API_KEY o LIVEKIT_API_SECRET.");
  }
});