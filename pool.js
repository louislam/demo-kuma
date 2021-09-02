const child_process = require("child_process");
const {getRandomInt, sleep} = require("./util");

class Pool {
    portList = {};

    constructor(startPort, endPort, execCommand, cwd, sessionTime = 300) {
        this.startPort = startPort;
        this.endPort= endPort;
        this.execCommand = execCommand;
        this.sessionTime = sessionTime;
        this.cwd = cwd;
    }

    async startInstance() {
        const port = await this.getFreePort();
        const cmd = this.execCommand.replace("%PORT%", port);

        console.log("Baked Cmd: " + cmd);

        try {
            const childProcess = child_process.exec(cmd, {
                cwd: this.cwd
            });

            const timeout = setTimeout(() => {
                console.log("Time up, call kill()")
                childProcess.kill();
            }, this.sessionTime * 1000);

            if (process.env.INSTANCE_LOG === "yes") {
                childProcess.stdout.on('data', (data) => {
                    console.log(`${data}`);
                });

                childProcess.stderr.on('data', (data) => {
                    console.error(`${data}`);
                });
            }

            childProcess.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);
            });

            childProcess.on('exit', (code) => {
                this.portList[port] = false;
                clearTimeout(timeout);
                console.log(`child process exited with code ${code}`);
            });

        } catch (e) {
            console.error(e);
            this.portList[port] = false;
        }

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

module.exports = Pool;