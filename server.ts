import "dotenv/config";
import express from "express";
import { Pool } from "./pool";
import * as http from "http";

const sessionTime = parseInt(process.env.SESSION_TIME);
const serverPort = parseInt(process.env.PORT_START);
const startPort = serverPort + 1;
const endPort = parseInt(process.env.PORT_END);
const execCommand = process.env.EXEC_COMMAND;
const endCommand = process.env.END_COMMAND;
const ga = process.env.GA;
const cwd = process.env.CWD;
const installURL = process.env.INSTALL_URL;

const app = express();
const pool = new Pool(startPort, endPort, execCommand, endCommand, cwd, sessionTime);

app.set("view engine", "ejs");

// Global Middleware
app.use(function (req, res, next) {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.removeHeader("X-Powered-By");
    next();
});

app.get("/", async (req, res) => {
    res.render("index", {
        sessionTime,
        ga,
        installURL
    });
});

app.post("/start", async (req, res) => {
    try {
        let port = await pool.startInstance();
        res.send({
            ok: true,
            port
        });
    } catch (e) {
        res.send({
            ok: false,
            msg: e.message,
        });
    }
});

http.createServer(app).listen(serverPort, () => {
    console.log(`Listening at http://localhost:${serverPort}`);
});

