import fs from "node:fs";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const create = async () => {
  // Write your code here

  fs.writeFile(
    `${__dirname}/files/fresh.txt`,
    "I am fresh and young",
    { flag: "wx+" },
    (error) => {
      if (error) {
        console.log("FS operation failed");
        console.log({ error });
      }
    }
  );
};

await create();
