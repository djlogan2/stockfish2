const Engine = require("node-uci").Engine;
const express = require("express");
const app = express();

const engines = {};
//
// Health check
//
app.get("/ok", (req, res) => {
    res.json({status: "ok"});
});

//
// Get engine status
//
app.get("/engines/", (req, res) => {
    const return_json = {status: "success", engines: []};
    for (let [id, engine] of Object.entries(engines)) {
        const ret_engine = {
            id: id,
            status: engine.status,
            allocated_by: engine.allocated_by,
            callback: engine.callback,
            engine_type: {...engine.id},
            options: Object.fromEntries(engine.options)
        };
        return_json.engines.push(ret_engine);
    }
    res.json(return_json);
});

//
// Start using an engine
// /start/xxx/yyy?callback=http://some/callback
//
app.get("/start/:engineId/:ourId", (req, res) => {
    const engine = engines[req.params.engineId];
    const result = {};
    if (!engine) {
        res.json({status: "error", error: "Engine " + req.params.engineId + " not found"});
        return;
    }

    const promise = engine.current_promise || Promise.resolve();
    promise
        .then(() => {
            if (engine.status !== "waiting") {
                res.json({status: "error", error: "Engine " + req.params.engineId + " not waiting"});
                return;
            }
            engine.status = "allocated";
            engine.allocated_by = req.params.ourId;
            engine.callback = req.query.callback;
            res.json({status: "success", engine_id: req.params.engineId, your_id: req.params.ourId});
        });
});

//
// Release an engine
//
app.get("/end/:engineId/:ourId", (req, res) => {
    const engine = engines[req.params.engineId];
    const result = {};
    if (!engine) {
        res.json({status: "error", error: "Engine " + req.params.engineId + " not found"});
        return;
    }

    const promise = engine.current_promise || Promise.resolve();
    promise
        .then(() => {
            if (engine.status === "waiting") {
                res.json({status: "error", error: "Engine " + req.params.engineId + " not allocated"});
                return;
            } else if (engine.allocated_by !== req.params.ourId) {
                res.json({status: "error", error: "Engine " + req.params.engineId + " not freed, owner id is invalid"});
                return;
            }
            engine.status = "waiting";
            delete engine.allocated_by;
            delete engine.callback;
            res.json({status: "success", engine_id: req.params.engineId, your_id: req.params.ourId});
        });


});

//
// Issue a UCI command to the engine
// /uci/xxx/yyy/setoption?args=["arg1", "arg2", "arg3", ...]
//
app.get("/uci/:engineId/:command", (req, res) => {

});

for (let x = 0; x < 8; x++) {
    const engine = new Engine(process.env.ENGINE);
    engine.id = [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
    engines[engine.id] = engine;
    engine.current_status = "notloaded";
    engine.current_status = new Engine(process.env.PATH);
    engine.current_promise = engine.init()
        .then(result => {
            engine.status = "waiting";
        })
        .then(() => {
            if (engine.next_promise) {
                engine.current_promise = engine.next_promise;
                delete engine.next_promise;
                return engine.current_promise;
            } else
                delete engine.current_promise;
        });
}

app.listen(process.env.PORT || 80, () =>
    console.log("Stockfish client listening on port 80!"),
);
