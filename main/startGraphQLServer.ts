import path from "path";
import fs from "fs";
import { app } from "electron";
import { fork, ChildProcess } from "child_process";

let serverProcess: ChildProcess;

export function startGraphQLServer() {
  const userDataPath = app.getPath("userData");

  const serverPath =
    process.env.NODE_ENV === "production"
      ? path.join(
          process.resourcesPath,
          "..",
          "graphql-server",
          "dist",
          "main.js"
        )
      : path.join("graphql-server", "dist", "main.js");

  let out = fs.openSync(path.join(userDataPath, "out.log"), "w");
  let err = fs.openSync(path.join(userDataPath, "err.log"), "w");
  const nodeModulesPath =
    process.env.NODE_ENV === "production"
      ? path.join(process.resourcesPath, "app.asar", "node_modules")
      : "node_modules";
  const options = {
    detached: true,
    stdio: ["pipe", out, err, "ipc"],
    env: {
      ...process.env,
      NEXT_PUBLIC_FOR_ELECTRON: "true",
      NODE_PATH: nodeModulesPath, // Override NODE_PATH
    },
  };
  serverProcess = fork(serverPath, [`--port=9002`], options);

  serverProcess.on("error", (error) => {
    console.log(
      `Error starting GraphQL server: ${error.message},  serverPath:${serverPath}`
    );
    fs.writeFileSync(
      path.join(userDataPath, "server-error.log"),
      `Error: ${error},  serverPath:${serverPath} `,
      "utf8"
    );
  });

  serverProcess.on("exit", (code, signal) => {
    fs.writeFileSync(
      path.join(userDataPath, "server-exit.log"),
      `exit: ${code},signal:${signal}`,
      "utf8"
    );
  });
}

export function stopGraphQLServer() {
  if (serverProcess) {
    serverProcess.kill("SIGKILL");
  }
}
