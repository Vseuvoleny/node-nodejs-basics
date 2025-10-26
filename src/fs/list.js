import { fileURLToPath } from "url";
import { dirname } from "path";
import { readdir } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const list = async () => {
  // Write your code here
  readdir(`${__dirname}/files`, (e, files) => {
    if (e) {
      throw new Error("FS operation failed");
    }

    console.log({ files });
  });
};

await list();
