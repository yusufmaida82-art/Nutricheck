import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

const databasePath = process.env.RENDER ? "/var/data/db.json" : "db.json";
if (process.env.RENDER) {
    mkdirSync("/var/data", { recursive: true });
    if (!existsSync(databasePath)) copyFileSync("db.json", databasePath);
}

const server = spawn("./node_modules/.bin/json-server", [
    "--watch", databasePath, "--host", "0.0.0.0", "--port", String(process.env.PORT || 3000)
], { stdio: "inherit" });
server.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGTERM", () => server.kill("SIGTERM"));
