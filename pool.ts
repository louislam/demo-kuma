import fs from "fs";
import isPortReachable from "is-port-reachable";
import child_process from "child_process";
import { getRandomInt, sleep } from "./util";

export class Pool {
    portList = {};

    constructor(startPort, endPort, execCommand, endCommand, cwd, sessionTime = 300) {
        this.startPort = startPort;
        this.endPort = endPort;
        this.execCommand = execCommand;
        this.endCommand = endCommand;
        this.sessionTime = sessionTime;
        this.cwd = cwd;
    }

    async startInstance() {
        // Check `lock` file exists
        if (fs.existsSync("lock")) {
            throw new Error("Server is locked");
        }

        const port = await this.getFreePort();
        const cmd = this.execCommand.replaceAll("%PORT%", port);

        console.log(`[${port}] Start a session`);

        try {
            const childProcess = child_process.exec(cmd, {
                cwd: this.cwd
            });

            const timeout = setTimeout(() => {
                console.log(`[${port}] Time up`);
                childProcess.kill("SIGINT");
            }, (this.sessionTime + 30) * 1000);     // Add some buffer for start/stop server

            if (process.env.INSTANCE_LOG === "all") {
                childProcess.stdout.on("data", (data) => {
                    console.log(`${data}`);
                });

                childProcess.stderr.on("data", (data) => {
                    console.error(`${data}`);
                });
            }

            childProcess.on("close", (code) => {
                //console.log(`child process close all stdio with code ${code}`);
            });

            childProcess.on("exit", (code) => {
                console.log(`[${port}] exited with code ${code}`);
                this.portList[port] = false;
                clearTimeout(timeout);

                const endCommand = this.endCommand.replaceAll("%PORT%", port);

                child_process.execSync(endCommand, {
                    cwd: this.cwd
                });
            });

        } catch (e) {
            console.error(e);
            this.portList[port] = false;
        }

        // When the port is opened, send to client
        while (! await isPortReachable(port)) {
            await sleep(200);
        }

        return port;
    }

    async getFreePort() {
        while (true) {
            const port = getRandomInt(this.startPort, this.endPort);

            if (! this.portList[port]) {
                this.portList[port] = true;
                return port;
            } else {

                // If full, sleep 1 second
                if (Object.keys(this.portList).length >= (this.endPort - this.startPort)) {
                    await sleep(1000);
                }

            }
        }
    }
}

