import type { User } from '../type/user.ts';
import http from 'node:http';
import { isValidUUID } from '../utils/isUuid.js';
import { randomUUID } from 'node:crypto';

import { readUsersFile, writeUsersFile } from '../utils/file.js';

type Req = http.IncomingMessage;

export type Res = http.ServerResponse;

export const getAllUsers = async (res: Res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const usersData = await readUsersFile();

    res.writeHead(200).end(JSON.stringify(usersData));
  } catch (error) {
    res.writeHead(500).end(JSON.stringify({ error: 'Something went wrong' }));
  }
};

export const getUserById = async (req: Req, res: Res) => {
  const userId = req.url!.split('/')[2];
  res.setHeader('Content-Type', 'application/json');

  try {
    if (!isValidUUID(userId ?? '')) {
      res.writeHead(400).end(JSON.stringify({ error: 'userId is not a uuid' }));
      return;
    }
    const usersData = await readUsersFile();
    const user = usersData.data.find(({ id }) => id === userId);
    if (user) {
      const current = { data: user };
      res.writeHead(200).end(JSON.stringify(current));
    } else {
      res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    res.writeHead(500).end(JSON.stringify({ error: 'Something went wrong' }));
  }
};

export const createUser = async (req: Req, res: Res) => {
  let body = '';
  res.setHeader('Content-Type', 'application/json');

  req.on('data', (data) => {
    body += data;
    if (body.length > 1e6) req.destroy();
  });

  req.on('end', async () => {
    try {
      const bodyObject = JSON.parse(body) as User;

      const hasRequiredFields = ['hobbies', 'age', 'name'].every(
        (key) => key in bodyObject,
      );

      if (!hasRequiredFields) {
        res.writeHead(400).end(
          JSON.stringify({
            error: 'No required fields. Should be hobbies, age and name',
          }),
        );
      }

      const newUser: User = { ...bodyObject, id: randomUUID() };
      const userData = await readUsersFile();
      userData.data.push(newUser);

      await writeUsersFile(userData);

      res.writeHead(201).end(JSON.stringify({ data: newUser }));
    } catch (error) {
      res.writeHead(500).end(JSON.stringify({ error: 'Something went wrong' }));
    }
  });
};

const updateUser = async (req: Req, res: Res) => {
  const userId = req.url!.split('/')[2];
  res.setHeader('Content-Type', 'application/json');

  let body = '';
  req.on('data', (data) => {
    body += data;
    if (body.length > 1e6) req.destroy();
  });

  req.on('end', async () => {
    try {
      const bodyObject = JSON.parse(body) as User;

      const bodyKeys = Object.keys(bodyObject);

      const hasOnlyAllowedFields = bodyKeys.every((key) =>
        ['hobbies', 'age', 'name'].includes(key),
      );

      if (!hasOnlyAllowedFields) {
        res.writeHead(400).end(
          JSON.stringify({
            error: 'No required fields. Should be hobbies, age or name',
          }),
        );
        return;
      }

      const userData = await readUsersFile();
      const userIdx = userData.data.findIndex(({ id }) => id === userId);

      if (userIdx === -1) {
        res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
        return;
      }

      const updated = userData.data.map((u) =>
        u.id === userId ? { ...u, ...bodyObject } : u,
      );

      const current = { data: updated };
      await writeUsersFile(current);

      res.writeHead(200).end(JSON.stringify({ data: updated[userIdx] }));
    } catch (error) {
      res.writeHead(500).end(JSON.stringify({ error: 'Something went wrong' }));
    }
  });
};

const deleteUser = async (req: Req, res: Res) => {
  const userId = req.url!.split('/')[2];
  res.setHeader('Content-Type', 'application/json');

  try {
    if (!isValidUUID(userId ?? '')) {
      res.writeHead(400).end(JSON.stringify({ error: 'userId is not a uuid' }));
      return;
    }
    const userData = await readUsersFile<User>();

    const user = userData.data.find(({ id }) => id === userId);

    if (!user) {
      res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    const updated = userData.data.filter((u) => u.id !== userId);

    const current = { data: updated };
    await writeUsersFile<User>(current);

    res.writeHead(204).end();
  } catch (error) {
    res.writeHead(500).end(JSON.stringify({ error: 'Something went wrong' }));
  }
};

export const userController = {
  getAll: getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
