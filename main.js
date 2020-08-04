const Engine = require("node-uci").Engine;
const express = require("express");
const app = express();

app.get("/ok", function(req, res){
    res.json({status: "ok"});
});

app.listen(process.env.PORT, () =>
    console.log(`Stockfish client listening on port ${process.env.PORT}!`),
);
