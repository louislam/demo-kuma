require('dotenv').config();

const express = require('express');
const Pool = require("./pool");

const sessionTime = parseInt(process.env.SESSION_TIME);
const serverPort = parseInt(process.env.PORT_START);
const startPort = serverPort  + 1;
const endPort = parseInt(process.env.PORT_END);
const execCommand = process.env.EXEC_COMMAND;
const cwd = process.env.CWD;

const app = express();

const pool = new Pool(startPort, endPort, execCommand, cwd, sessionTime);

app.get('/', async (req, res) => {
    await pool.startInstance();
    res.send("hi")
});

app.listen(serverPort, () => {
    console.log(`Listening at http://localhost:${serverPort}`)
});






