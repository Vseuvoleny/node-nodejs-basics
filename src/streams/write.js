import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const write = async () => {
  // Write your code here
  const writebldeStream = fs.createWriteStream(
    `${__dirname}/files/fileToWrite.txt`
  );

  process.stdin.setEncoding("utf-8");

  writebldeStream.on("open", () => {
    console.log("Запись пошла");
  });

  process.stdin.on("data", (data) => {
    writebldeStream.write(data);
  });
  process.stdin.on("error", (err) => {
    process.stdout(err);
  });

  writebldeStream.on("close", () => {
    console.log("Стрим закрыт");
  });

  process.stdin.on("end", () => {
    writebldeStream.destroy();
  });
};

await write();
