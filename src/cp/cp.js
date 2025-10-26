import childprocces from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const spawnChildProcess = async (args) => {
  // Write your code here
  const child = childprocces.spawn(`node`, [
    `${__dirname}/files/script.js`,
    ...args,
  ]);

  process.stdin.on("data", (data) => {
    child.stdin.write(data);
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  process.stdin.on("end", () => {
    child.stdin.end();
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  child.on("error", (error) => {
    console.error(error);
  });

  child.on("exit", (code, signal) => {
    console.log([code, signal]);
  });

  return child;
};

// Put your arguments in function call to test this functionality
spawnChildProcess(["node", "one"]);
