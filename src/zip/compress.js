import zip from "node:zlib";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compress = async () => {
  // Write your code here

  const readableStream = fs.createReadStream(
    `${__dirname}/files/fileToCompress.txt`
  );
  const writebldeStream = fs.createWriteStream(`${__dirname}/files/archive.gz`);

  const stream = zip.createGzip();

  readableStream.pipe(stream).pipe(writebldeStream);

  writebldeStream.on("finish", () => {

    fs.rm(`${__dirname}/files/fileToCompress.txt`, (e) => {
      if (e) {
        throw e;
      }
    });
    console.log("File compressed successfully!");
  });
};

await compress();
