import { fileURLToPath } from "url";
import { dirname } from "path";
import { rm } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const remove = async () => {
  // Write your code here
  rm(`${__dirname}/files/fileToRemove.txt`, (err) => {
    if (err) {
      throw new Error("FS operation failed");
    }
    console.log("Файл удален");
  });
};

await remove();
