import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFile } from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const read = async () => {
  // Write your code here
  readFile(
    `${__dirname}/files/fileToRead.txt`,
    { encoding: "utf-8" },
    (err, data) => {
      if (err) {
        throw new Error("FS operation failed");
      }
      console.log({ data: data.split(os.EOL).join(" ") });
    }
  );
};

await read();
