import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { stdout } from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const read = async () => {
  const readableStream = fs.createReadStream(
    `${__dirname}/files/fileToRead.txt`,
    { encoding: "utf-8" }
  );

  readableStream.pipe(process.stdout);

  readableStream.on("open", () => {
    console.log("Открыт стрим");
  });
  readableStream.on("error", (error) => {
    console.error("Ошибка при чтении файла:", error.message);
    process.exit(1);
  });
  readableStream.on("end", () => {
    process.stdout.write("\n");
    console.log("Закончено чтение");
  });
};

await read();
