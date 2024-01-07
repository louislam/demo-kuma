import childProcess from "child_process";
import childProcessAsync from "promisify-child-process";
import { sleep } from "./util";
import crypto from "crypto";
import { sessionTime, stackPrefix, startTimeout, servicePort, entryPath, dockerNetwork, serviceName } from "./config";

export class Pool {
    /**
     * sessionList[sessionID] = serviceURL
     */
    sessionList: Record<string, string> = {};

    async startInstance() {
        let sessionID : string = "";

        while (true) {
            sessionID = crypto.randomUUID().substring(0, 8);
            if (this.sessionList[sessionID] === undefined) {
                break;
            }
        }

        let timeout : NodeJS.Timeout;

        console.log(`[${sessionID}] Start a session`);

        await childProcessAsync.spawn("docker", [
            "compose",
            "--file", "compose-demo.yaml",
            "-p", `${stackPrefix}-${sessionID}`,
            "up",
            "-d",
        ], {
            encoding: "utf-8",
        });

        let startStackTime = Date.now();
        let baseURL = "";

        // Wait until the service is opened
        while (true) {
            try {
                let ip = await this.getServiceIP(sessionID);
                baseURL = `http://${ip}:${servicePort}`;
                let entryURL = baseURL + entryPath;

                console.log("Checking entry: " + entryURL);

                // Try to access the index page
                let res = await fetch(entryURL);
                await res.text();

                if (res.status === 200) {
                    break;
                }
            } catch (e) {
            }

            await sleep(2000);
            if (Date.now() - startStackTime > startTimeout * 1000) {
                throw new Error("Start instance timeout");
            }
        }

        let endSessionTime = Date.now() + sessionTime * 1000;

        // Timer for closing the session
        setTimeout(async () => {
            console.log(`[${sessionID}] Time's up`);
            await this.stopInstance(sessionID);
            delete this.sessionList[sessionID];
        }, (sessionTime) * 1000);

        this.sessionList[sessionID] = baseURL;
        console.log(`[${sessionID}] Session started`);

        return {
            sessionID,
            endSessionTime,
        };
    }

    async stopInstance(sessionID : string) {
        await childProcessAsync.spawn("docker", [
            "compose",
            "-f", "compose-demo.yaml",
            "-p", `${stackPrefix}-${sessionID}`,
            "down",
            "--volumes",
            "--remove-orphans",
        ], {
            encoding: "utf-8",
            env: {
                ...process.env,
            },
        });
    }

    getServiceURL(sessionID : string) : string | undefined {
        return this.sessionList[sessionID];
    }

    async getServiceIP(sessionID : string) : Promise<string> {
        let response = await childProcessAsync.spawn("docker", [
            "inspect",
            `${stackPrefix}-${sessionID}-${serviceName}-1`,
            "--format", "json"
        ], {
            encoding: "utf-8",
        });

        if (typeof response.stdout !== "string") {
            throw new Error("No output");
        }

        let array = JSON.parse(response.stdout);

        if (!Array.isArray(array)) {
            throw new Error("Not an array");
        }

        if (array.length === 0) {
            throw new Error("Array is empty");
        }

        let obj = array[0];

        // Check if the object is valid
        if (!obj || typeof obj !== "object") {
            throw new Error("Not an object");
        }

        let networkSettings = obj.NetworkSettings;

        if (!networkSettings) {
            throw new Error("No network settings");
        }

        let networks = obj.NetworkSettings.Networks;

        if (!networks) {
            throw new Error("No networks");
        }

        // Find the target network
        let network = networks[dockerNetwork];

        if (!network) {
            throw new Error("Network not found");
        }

        let ip = network.IPAddress;

        if (!ip) {
            throw new Error("IP not found");
        }

        return ip;
    }

    async clearInstance() {
        let result = await childProcessAsync.spawn("docker", [
            "compose",
            "ls",
            "--format", "json",
        ], {
            encoding: "utf-8",
        });

        if (typeof result.stdout === "string") {
            let list = JSON.parse(result.stdout);
            for (let stack of list) {
                if (stack.Name?.startsWith(stackPrefix + "-")) {
                    console.log(`Clearing ${stack.Name}`);
                    let result = await childProcessAsync.spawn("docker", [
                        "compose",
                        "--file", "compose-demo.yaml",
                        "-p", stack.Name,
                        "down",
                    ], {
                        encoding: "utf-8",
                    });

                    console.log(result.stdout, result.stderr);
                }
            }
        }
    }
}

