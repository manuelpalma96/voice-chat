require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

const rooms = {}; // Almacenamiento en memoria: { roomId: { password: '...', participants: 0 } }

if (!API_KEY || !API_SECRET) {
  throw new Error("LIVEKIT_API_KEY y LIVEKIT_API_SECRET son requeridos");
}

// Endpoint para crear una nueva sala
app.post("/create-room", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "La contraseña es requerida para crear una sala." });
  }

  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  rooms[roomId] = { password: password, participants: 0 };

  console.log(`Sala creada: ${roomId}`);
  res.json({ roomId });
});

// Endpoint para obtener un token y unirse a una sala
app.get("/token", async (req, res) => {
  const { roomId, password, username } = req.query;

  if (!rooms[roomId]) {
    return res.status(404).json({ error: "La sala no existe." });
  }

  if (rooms[roomId].password !== password) {
    return res.status(401).json({ error: "Contraseña incorrecta." });
  }

  if (!username) {
    return res.status(400).json({ error: "El nick es requerido." });
  }

  rooms[roomId].participants++;
  console.log(`Usuario '${username}' se unió a la sala ${roomId}. Participantes: ${rooms[roomId].participants}`);

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: username,
    ttl: '1h', // Aumentamos el tiempo de vida del token
  });

  at.addGrant({ roomJoin: true, room: roomId });

  const token = await at.toJwt();
  res.json({ token });
});

// Endpoint para notificar que un usuario ha salido
app.post("/leave-room", (req, res) => {
  const { roomId } = req.body;
  if (rooms[roomId]) {
    rooms[roomId].participants--;
    console.log(`Un usuario ha salido de la sala ${roomId}. Participantes: ${rooms[roomId].participants}`);
    if (rooms[roomId].participants <= 0) {
      delete rooms[roomId];
      console.log(`Sala ${roomId} eliminada por inactividad.`);
    }
  }
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (API_KEY && API_SECRET) {
    console.log(`Backend listo en ${port}. API Key cargada: ${API_KEY.substring(0, 4)}..., Longitud del Secret: ${API_SECRET.length}`);
  } else {
    console.log("Error: No se encontraron las variables de entorno LIVEKIT_API_KEY o LIVEKIT_API_SECRET.");
  }
});