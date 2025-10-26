import fs from "node:fs";
import path from "node:path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rename = async () => {
  // Write your code here
  const originFile = "wrongFilename.txt";
  const propefFile = "properFilename.md";

  const isExistOrigin = fs.existsSync(`${__dirname}/files/${originFile}`);
  const isExistCopy = fs.existsSync(`${__dirname}/files/${propefFile}`);
  if (isExistCopy || !isExistOrigin) {
    console.log(
      isExistCopy
        ? `Файл уже переименован на ${propefFile}`
        : `Файла ${originFile} не существует`
    );

    throw new Error("FS operation failed");
  }
  fs.rename(
    `${__dirname}/files/${originFile}`,
    `${__dirname}/files/${propefFile}`,
    (err) => {
      if (err) throw new Error("FS operation failed");
      console.log("Переименование завершено!");
    }
  );
};

await rename();
