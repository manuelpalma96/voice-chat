const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
app.use(cors());

const API_KEY = "APIDkQMBsAbQUP5";
const API_SECRET = "GLbOPMS49sIiEH5qC6LpUcNj1SSp9hezhJe4yBReKCB";

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