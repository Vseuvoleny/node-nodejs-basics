import os from 'node:os';
import readline from 'node:readline';
import process, { exit } from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createReadStream, createWriteStream, rm } from 'node:fs';
import zip from 'node:zlib';
import { pipeline } from 'stream/promises';

export class CommandManager {
  homedir = '';
  user = '';
  currentDir = '';

  constructor() {
    this.homedir = os.homedir();
    this.user = process.argv
      .slice(2)
      .find((elem) => {
        return elem.includes('--username');
      })
      .split('=')[1];
    this.currentDir = this.homedir;
  }

  command = {
    ls: () => this.ls(),
    up: () => this.up(),
    cd: ([arg]) => this.cd(arg),
    os: ([arg]) => this.osFn(arg),
    hash: ([arg]) => this.hash(arg),
    cat: ([arg]) => this.cat(arg),
    add: ([arg]) => this.add(arg),
    mkdir: ([arg]) => this.mkdir(arg),
    rn: ([fileName, newName]) => this.rn(fileName, newName),
    cp: ([fileName, newName]) => this.cp(fileName, newName),
    mv: ([fileName, newName]) => this.mv(fileName, newName),
    rm: ([fileName]) => this.rm(fileName),
    compress: ([fileName, newName]) => this.compress(fileName, newName),
    decompress: ([fileName, newName]) => this.decompress(fileName, newName),
  };

  init() {
    process.stdout.write(`Welcome to the File Manager, ${this.user}!\n\n`);
    process.stdout.write(`You are currently in ${this.currentDir}!\n\n`);
    const readlineInterface = readline.createInterface({
      input: process.stdin,
    });
    readlineInterface.on('line', (line) => {
      try {
        const [command, ...args] = line.split(' ');

        this.command[command](args);
      } catch (err) {
        console.log(err);

        console.log('Invalid input');
      }
    });
    process.on('SIGINT', () => {
      process.stdout.write(
        `\n\nThank you for using File Manager, ${this.user}, goodbye!\n\n`,
      );
      exit(0);
    });
  }

  async ls() {
    const files = await fs.readdir(this.currentDir, { withFileTypes: true });

    const mappedFiles = files.map((file) => {
      const isDir = file.isDirectory();
      return { name: file.name, Type: isDir ? 'directory' : 'file' };
    });
    console.table(mappedFiles);
  }

  up() {
    if (this.currentDir === this.homedir) {
      return;
    }

    const newPath = this.currentDir.split(path.sep);
    newPath.pop();
    const newPathString = newPath.join(path.sep);
    this.currentDir = newPathString;
  }

  async cd(arg) {
    const normalized = path.normalize(path.join(this.currentDir, arg));

    try {
      await fs.access(normalized);
      this.currentDir = path.join(this.currentDir, arg);
      console.log('Current directory: ', this.currentDir);
    } catch (error) {
      console.log('Some error happender:', { error });
    }
  }

  osFn(arg) {
    const option = {
      '--EOL': () => JSON.stringify(os.EOL),
      '--cpus': () => os.cpus(),
      '--homedir': () => os.homedir(),
      '--username': () => os.userInfo().username,
      '--architecture': () => os.arch(),
    };
    try {
      const result = option[arg]();
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  async hash(args) {
    const normalized = path.normalize(path.join(this.currentDir, args));
    try {
      const stats = await fs.stat(normalized);
      if (!stats.isFile()) {
        console.log('Invalid input: Path is not a file');
        return;
      }
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(normalized);

      stream.on('end', () => {
        const str = hash.digest('hex');
        console.log(`Hash: ${str}`);
      });

      stream.on('error', (error) => {
        process.stdout.write(`\n\nOperation failed\n\n`);
      });

      stream.pipe(hash);
    } catch (error) {
      process.stdout.write(`\n\nOperation failed\n\n`);
    }
  }

  cat(pathToFile) {
    if (!path.isAbsolute(pathToFile)) {
      pathToFile = `${this.currentDir}/${pathToFile}`;
    }

    try {
      const normalized = path.normalize(pathToFile);
      const stream = createReadStream(normalized);
      stream
        .on('error', (error) => {
          console.log('Invalid input', error.message);
        })
        .pipe(process.stdout);
    } catch (error) {
      console.log('Invalid input', error.message);
    }
  }

  async add(fileName) {
    try {
      await fs.writeFile(path.join(this.currentDir, fileName), '', {
        flag: 'ax',
      });
    } catch (error) {
      process.stdout.write(`\n\nOperation failed\n\n`);
    }
  }

  async mkdir(dirName) {
    try {
      await fs.mkdir(path.join(this.currentDir, dirName));
    } catch (error) {
      console.log({ error });

      process.stdout.write(`\n\nOperation failed\n\n`);
    }
  }

  async rn(filePath, newFilename) {
    try {
      const newPath = filePath.split(path.sep);
      newPath.pop();

      await fs.rename(
        path.join(this.currentDir, filePath),
        path.join(this.currentDir, ...newPath, newFilename),
      );
    } catch (error) {
      process.stdout.write(`\n\nOperation failed\n\n`);
    }
  }

  async cp(filePath, newPath) {
    try {
      const sourcePath = path.isAbsolute(filePath)
        ? path.normalize(filePath)
        : path.normalize(path.join(this.currentDir, filePath));

      let targetPath = path.isAbsolute(newPath)
        ? path.normalize(newPath)
        : path.normalize(path.join(this.currentDir, newPath));

      const stats = await fs.stat(sourcePath);
      if (!stats.isFile()) {
        process.stdout.write(`\n\nSource path is not a file\n\n`);
        return;
      }

      try {
        const targetStats = await fs.stat(targetPath);
        if (targetStats.isDirectory()) {
          targetPath = path.join(targetPath, path.basename(sourcePath));
        }
      } catch (error) {
        if (targetPath.endsWith(path.sep) || !path.extname(targetPath)) {
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
        }
      }

      await new Promise((resolve, reject) => {
        const readStream = createReadStream(sourcePath);
        const writeStream = createWriteStream(targetPath);

        readStream
          .on('error', reject)
          .pipe(writeStream)
          .on('error', reject)
          .on('finish', resolve);
      });

      process.stdout.write(`\n\nFile copied to ${targetPath}\n\n`);
    } catch (error) {
      process.stdout.write(`\n\nOperation failed: ${error.message}\n\n`);
    }
  }

  async mv(filePath, newPath) {
    try {
      const sourcePath = path.isAbsolute(filePath)
        ? path.normalize(filePath)
        : path.normalize(path.join(this.currentDir, filePath));

      let targetPath = path.isAbsolute(newPath)
        ? path.normalize(newPath)
        : path.normalize(path.join(this.currentDir, newPath));

      const stats = await fs.stat(sourcePath);
      if (!stats.isFile()) {
        process.stdout.write(`\n\nSource path is not a file\n\n`);
        return;
      }

      try {
        const targetStats = await fs.stat(targetPath);
        if (targetStats.isDirectory()) {
          targetPath = path.join(targetPath, path.basename(sourcePath));
        }
      } catch (error) {
        if (targetPath.endsWith(path.sep) || !path.extname(targetPath)) {
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
        }
      }

      await new Promise((resolve, reject) => {
        const readStream = createReadStream(sourcePath);
        const writeStream = createWriteStream(targetPath);

        readStream
          .on('error', reject)
          .pipe(writeStream)
          .on('error', reject)
          .on('finish', resolve);
      });

      await fs.unlink(sourcePath);

      process.stdout.write(`\n\nFile movied to ${targetPath}\n\n`);
    } catch (error) {
      process.stdout.write(`\n\nOperation failed: ${error.message}\n\n`);
    }
  }

  async rm(filePath) {
    try {
      const sourcePath = path.isAbsolute(filePath)
        ? path.normalize(filePath)
        : path.normalize(path.join(this.currentDir, filePath));
      await fs.unlink(sourcePath, { recursive: true, force: true });
    } catch (error) {
      process.stdout.write(`\n\nOperation failed: ${error.message}\n\n`);
    }
  }

  async compress(filePath, newPath) {
    const sourcePath = path.isAbsolute(filePath)
      ? path.normalize(filePath)
      : path.normalize(path.join(this.currentDir, filePath));

    let newSourcePath = path.isAbsolute(newPath)
      ? path.normalize(newPath)
      : path.normalize(path.join(this.currentDir, newPath));

    const stats = await fs.stat(sourcePath);
    if (!stats.isFile()) {
      process.stdout.write(`\n\nSource path is not a file\n\n`);
      return;
    }

    if (!newSourcePath.endsWith('.gz')) {
      newSourcePath += '.gz';
    }

    const readableStream = createReadStream(sourcePath);
    const writebldeStream = createWriteStream(newSourcePath);

    const stream = zip.createBrotliCompress();

    try {
      await pipeline(readableStream, stream, writebldeStream);
      process.stdout.write('\n\nFinish compress\n\n');
    } catch (error) {
      process.stdout.write(`\n\nOperation failed: ${error.message}\n\n`);
    }
  }

  async decompress(filePath, newPath) {
    const sourcePath = path.isAbsolute(filePath)
      ? path.normalize(filePath)
      : path.normalize(path.join(this.currentDir, filePath));
    let newSourcePath = path.isAbsolute(newPath)
      ? path.normalize(newPath)
      : path.normalize(path.join(this.currentDir, newPath));

    const stats = await fs.stat(sourcePath);
    if (!stats.isFile()) {
      process.stdout.write(`\n\nSource path is not a file\n\n`);
      return;
    }

    if (!sourcePath.endsWith('.gz')) {
      process.stdout.write(
        `\n\nFile is not a Brotli compressed file (.gz)\n\n`,
      );
      return;
    }

    try {
      const targetStats = await fs.stat(newSourcePath);
      if (targetStats.isDirectory()) {
        const originalName = path.basename(sourcePath, '.gz');
        newSourcePath = path.join(newSourcePath, originalName);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Если файл не существует, проверяем является ли путь директорией
        if (newSourcePath.endsWith(path.sep)) {
          const originalName = path.basename(sourcePath, '.gz');
          newSourcePath = path.join(newSourcePath, originalName);
        }
      } else {
        throw error;
      }
    }

    const zstream = zip.createBrotliDecompress();

    const readableStream = createReadStream(sourcePath);
    const writebldeStream = createWriteStream(newSourcePath);

    try {
      await pipeline(readableStream, zstream, writebldeStream);
      process.stdout.write('\n\nFinish decompress\n\n');
    } catch (error) {
      process.stdout.write(`\n\nOperation failed: ${error.message}\n\n`);
    }
  }
}
