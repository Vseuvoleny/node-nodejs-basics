import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';
import { userController } from './controllers/user.controller';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.join('.', '.env', `.env.${process.env.NODE_ENV?.toLowerCase()}`),
});

const PORT = process.env.PORT;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  let currentWorkerIndex = 0;
  const workerPorts: number[] = [];

  for (let i = 0; i < numCPUs; i++) {
    const port = Number(PORT) + i + 1;
    workerPorts.push(port);
    cluster.fork({ WORKER_PORT: port.toString() });
  }

  const balancer = http.createServer((req, res) => {
    const port = workerPorts[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % workerPorts.length;

    console.log(`Исполнено воркером на порту: ${port}`);

    const proxy = http.request(
      {
        hostname: 'localhost',
        port: port,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode!, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    req.pipe(proxy);
  });

  balancer.listen(PORT);
} else {
  const workerPort = process.env.WORKER_PORT;
  console.log(`Воркер: ${process.pid}`);
  const server = http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      switch (req.method) {
        case 'GET':
          if (['', '/users'].includes(req.url!)) {
            await userController['getAll'](res);
          } else if (req.url?.startsWith('/users/')) {
            await userController['getUserById'](req, res);
          } else {
            res.writeHead(404).end('Error: Unhandled route');
          }
          return;
        case 'POST':
          if ('/users' === req.url) {
            await userController['createUser'](req, res);
          } else {
            res.writeHead(404).end('Error: Unhandled route');
          }
          return;

        case 'PUT':
          if (req.url?.startsWith('/users/')) {
            userController['updateUser'](req, res);
          } else {
            res.writeHead(404).end('Error: Unhandled route');
          }
          return;
        case 'DELETE':
          if (req.url?.startsWith('/users/')) {
            userController['deleteUser'](req, res);
          } else {
            res.writeHead(404).end('Error: Unhandled route');
          }
          return;
        default:
          res.writeHead(404).end('Error: Unhandled route');
      }
    },
  );
  server.listen(workerPort, () => {
    console.log(`Server running on port ${workerPort}`);
  });
}
