import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const copy = async () => {
  // Write your code here
  const isExistCopy = fs.existsSync(`${__dirname}/files_copy`);
  const isExistOrigin = fs.existsSync(`${__dirname}/files`);
  if (isExistCopy || !isExistOrigin) {
    console.log("Папки существуют");

    throw new Error("FS operation failed");
  }
  fs.mkdir(`${__dirname}/files_copy`, { recursive: true }, (e) => {
    if (e) {
      throw new Error("FS operation failed");
    }
    console.log("Создана папка files_copy");
  });
  fs.readdir(`${__dirname}/files`, (e, files) => {
    if (e) {
      throw new Error("FS operation failed");
    }

    for (const file of files) {
      fs.copyFile(
        `${__dirname}/files/${file}`,
        `${__dirname}/files_copy/${file}`,
        (e) => {
          if (e) {
            console.log({ e });

            throw new Error("FS operation failed");
          }
          console.log("Копирование завершено");
        }
      );
    }
  });
};

await copy();
