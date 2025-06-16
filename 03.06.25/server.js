const express = require("express");
const mysql = require("mysql2");
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "webbruker",
  password: "pass123",
  database: "toska",
});

// Endepunkt som henter lageret, gruppert etter kategori
app.get("/api/lager", (req, res) => {
  db.query("SELECT * FROM komponenter", (err, result) => {
    if (err) return res.status(500).send(err);

    const lager = {
      cpu: [],
      ram: [],
      ssd: [],
      gpu: [],
      os: [],
    };

    result.forEach((komponent) => {
      if (lager[komponent.kategori]) {
        lager[komponent.kategori].push(komponent);
      }
    });

    res.json(lager);
  });
});

// Endepunkt for å oppdatere lageret
app.post("/api/update-lager", (req, res) => {
  const { kategori, navn, antall } = req.body;

  console.log("Fikk forespørsel for oppdatering:");
  console.log("Kategori:", kategori);
  console.log("Navn:", navn);
  console.log("Antall:", antall);

  const sql = `UPDATE komponenter SET antall = ? WHERE kategori = ? AND navn = ?`;
  db.query(sql, [antall, kategori, navn], (err, result) => {
    if (err) {
      console.error("Feil ved oppdatering:", err);
      return res.status(500).json({ melding: "Feil under oppdatering" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ melding: "Fant ikke komponenten" });
    }

    res.json({ melding: "Lager oppdatert" });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server kjører på http://localhost:${port}`);
});
