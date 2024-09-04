const util = require("util");
const { spawn, spawnSync } = require("child_process");

const setTimeoutPromise = util.promisify(setTimeout);

checkServer()
  .then(() => {
    console.log("server runs successfully");
    process.exit(0);
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });

// checkServer checks the graphql-server can run without error
async function checkServer(waitTime = 25000) {
  const server = runServer();
  await setTimeoutPromise(waitTime);
  try {
    generateTypes();
  } catch (err) {
    if (!server.killed) server.kill();
    // throw error to checkServer catch block
    throw new Error(err);
  }
  if (!server.killed) server.kill();
}

// generateTypes runs the generate graphql types command in the web package
function generateTypes() {
  spawnSync("yarn", ["install"], {
    cwd: `${__dirname}/../web`,
    stdio: "inherit",
  });
  return spawnSync("yarn", ["run", "generate-types"], {
    cwd: `${__dirname}/../web`,
    stdio: "inherit",
  });
}

// runServer runs the graphql server and exits with error if the
// server writes to stderr or receives an error event
export function runServer() {
  const server = spawn("node", ["dist/main.js"], {
    shell: true,
    cwd: __dirname,
  });
  server.stdout.on("data", data => {
    console.log(`${data}`);
  });
  server.stderr.on("data", data => {
    console.log(`${data}`);
    if (!server.killed) server.kill();
    process.exit(1);
  });
  server.on("error", err => {
    console.error(err);
    if (!server.killed) server.kill();
    process.exit(1);
  });
  return server;
}
