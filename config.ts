export const serverPort = parseInt(process.env.SERVER_PORT) || 80;
export const stackPrefix = process.env.STACK_PREFIX || "demo";
export const serviceName = process.env.STACK_MAIN_SERVICE_NAME || "main";
export const servicePort = parseInt(process.env.STACK_MAIN_SERVICE_PORT) || 80;
export const entryPath = process.env.STACK_MAIN_SERVICE_ENTRY_PATH || "/";
export const dockerNetwork = process.env.DOCKER_NETWORK_NAME || "demo-kuma";
export const websiteName = process.env.WEBSITE_NAME || "Demo";
export const sessionTime = parseInt(process.env.SESSION_TIME) || 600;
export const startTimeout = parseInt(process.env.START_TIMEOUT) || 60;
export const installURL = process.env.INSTALL_URL;
export const showEntry = (process.env.SHOW_ENTRY === "true");

