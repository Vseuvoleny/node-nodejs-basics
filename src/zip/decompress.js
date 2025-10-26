import zip from "node:zlib";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const decompress = async () => {
  // Write your code here

  const readableStream = fs.createReadStream(`${__dirname}/files/archive.gz`);
  const writebldeStream = fs.createWriteStream(
    `${__dirname}/files/fileToCompress.txt`
  );

  const stream = zip.createGunzip();

  readableStream.pipe(stream).pipe(writebldeStream);

  writebldeStream.on("close", () => {
    fs.rm(`${__dirname}/files/archive.gz`, (e) => {
      if (e) {
        throw e;
      }
    });
    console.log("File decompressed successfully!");
  });
};

await decompress();
