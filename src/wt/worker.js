import wt from "node:worker_threads";
import { fileURLToPath } from "url";

// n should be received from main thread
const nthFibonacci = (n) =>
  n < 2 ? n : nthFibonacci(n - 1) + nthFibonacci(n - 2);

const sendResult = () => {
  try {
    const result = nthFibonacci(wt.workerData);
    wt.parentPort.postMessage({ data: result, status: "resolved" });
  } catch (error) {
    wt.parentPort.postMessage({ data: null, status: "error" });
  }
};

sendResult();
