import path from 'node:path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '..', '..', 'src', 'mock', 'users.json');

export const readUsersFile = async <
  T extends Record<string, unknown>,
>(): Promise<{ data: T[] }> => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    throw error;
  }
};

export const writeUsersFile = async <T extends Record<string, unknown>>(data: {
  data: T[];
}): Promise<void> => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
