import http from 'node:http';
import dotenv from 'dotenv';

import path from 'node:path';

import { userController } from './controllers/user.controller';

dotenv.config({
  path: path.join('.', '.env', `.env.${process.env.NODE_ENV?.toLowerCase()}`),
});

const PORT = process.env.PORT;

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
