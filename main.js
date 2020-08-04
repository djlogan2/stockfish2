const Engine = require("node-uci").Engine;
const express = require("express");
const app = express();

app.get("/ok", function(req, res){
    res.json({status: "ok"});
});

app.listen(80, () =>
    console.log("Stockfish client listening on port 80!"),
);
