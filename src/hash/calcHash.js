import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const calculateHash = async () => {
  // Write your code here

  return new Promise((resolve) => {
    const hash = crypto.createHash("sha-256");
    const stream = fs.createReadStream(
      `${__dirname}/files/fileToCalculateHashFor.txt`
    );

    stream.on("end", () => {
      const str = hash.digest("hex");
      resolve(str);
    });

    stream.pipe(hash);
  });
};

await calculateHash();
