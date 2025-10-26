import { fileURLToPath } from "url";
import { dirname } from "path";
import os from "node:os";
import { Worker } from "node:worker_threads";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const performCalculations = async () => {
  // Write your code here
  const cores = os.cpus().length;

  const workers = Array.from({ length: cores }, (_, idx) => {
    return new Promise((resolve) => {
      const workerNumber = 10 + idx;

      const worker = new Worker(`${__dirname}/worker.js`, {
        workerData: workerNumber,
      });

      worker.on("message", (data) => {
        resolve(data);
      });
      worker.on("error", (data) => {
        resolve(data);
      });
      worker.on("exit", (code) => {
        console.log({ code });
      });
    });
  });
  const result = await Promise.all(workers);
  console.log("Результат вычислений: ", result);
};

await performCalculations();
