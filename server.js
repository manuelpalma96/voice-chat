require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(cors());

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!API_KEY || !API_SECRET) {
  throw new Error("LIVEKIT_API_KEY y LIVEKIT_API_SECRET son requeridos");
}

app.get("/token", async (req, res) => {
  const room = req.query.room || "sala1";
  const user = "user_" + Math.floor(Math.random() * 1000);

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: user,
  });

  at.addGrant({ roomJoin: true, room });

    const token = await at.toJwt();
  console.log("Token generado:", token);
  res.json({ token });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend listo en ${port}`));