// const path = require('path');
import path from "node:path";
import { release, version } from "node:os";
// const { release, version } = require('os');
import { createServer } from "http";
// const { createServer: createServerHttp } = require('http');
// require('./files/c');
import { fileURLToPath } from "url";
import { dirname } from "path";
import "./files/c.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const random = Math.random();

let unknownObject;

if (random > 0.5) {
  unknownObject = await import("./files/a.json", { with: { type: "json" } });
} else {
  unknownObject = await import("./files/b.json", { with: { type: "json" } });
}

console.log(`Release ${release()}`);
console.log(`Version ${version()}`);
console.log(`Path segment separator is "${path.sep}"`);

console.log(`Path to current file is ${__filename}`);
console.log(`Path to current directory is ${__dirname}`);

const myServer = createServer((_, res) => {
  res.end("Request accepted");
});

const PORT = 3000;

console.log(unknownObject);

myServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log("To terminate it, use Ctrl+C combination");
});

// module.exports = {
//   unknownObject,
//   myServer,
// };

export { unknownObject, myServer };
