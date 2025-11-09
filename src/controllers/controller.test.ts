import { getAllUsers, createUser, getUserById } from './user.controller';
import { readUsersFile, writeUsersFile } from '../utils/file';
import { isValidUUID } from '../utils/isUuid';
import { randomUUID } from 'node:crypto';

jest.mock('../utils/file.ts', () => ({
  readUsersFile: jest.fn(),
  writeUsersFile: jest.fn(),
}));

jest.mock('../utils/isUuid.ts', () => ({
  isValidUUID: jest.fn(),
}));

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

const createMockResponse = () => {
  const res: any = {};
  res.setHeader = jest.fn().mockReturnValue(res);
  res.writeHead = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

const createMockRequest = () => {
  const req: any = {};
  req.on = jest.fn();
  return req;
};

describe('Tests for user.controller', () => {
  let res: any;
  let req: any;
  const mockUsers = {
    data: [
      { id: '1', name: 'John', age: 55, hobbies: ['js'] },
      { id: '2', name: 'Pete', age: 45, hobbies: ['swift'] },
      { id: '3', name: 'Mark', age: 35, hobbies: ['kotlin'] },
    ],
  };
  beforeEach(() => {
    res = createMockResponse();
    req = createMockRequest();
    jest.clearAllMocks();
  });

  test('should return all users on GET request /users/', async () => {
    (readUsersFile as jest.Mock).mockResolvedValue(mockUsers);

    await getAllUsers(res);

    expect(res.writeHead).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledWith(JSON.stringify(mockUsers));
  });

  test('should return user on GET request /users/userId', async () => {
    (readUsersFile as jest.Mock).mockResolvedValue(mockUsers);
    (isValidUUID as jest.Mock).mockResolvedValue(true);
    req.url = '/users/3';
    await getUserById(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        data: { id: '3', name: 'Mark', age: 35, hobbies: ['kotlin'] },
      }),
    );
  });

  test('should create user on POST request /users/', async () => {
    (readUsersFile as jest.Mock).mockResolvedValue(mockUsers);
    (writeUsersFile as jest.Mock).mockResolvedValue(undefined);
    (randomUUID as jest.Mock).mockReturnValue('5');

    const userData = {
      name: 'Mat',
      age: 55,
      hobbies: ['swim'],
    };

    const dataCallbacks: any[] = [];
    const endCallbacks: any[] = [];

    (req.on = jest.fn((event, callback) => {
      if (event === 'data') {
        dataCallbacks.push(callback);
      } else if (event === 'end') {
        endCallbacks.push(callback);
      }
    })),
      await createUser(req, res);

    dataCallbacks.forEach((callback) => callback(JSON.stringify(userData)));
    endCallbacks.forEach((callback) => callback());

    await new Promise(process.nextTick);

    expect(res.writeHead).toHaveBeenCalledWith(201);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({
        data: {
          ...userData,
          id: '5',
        },
      }),
    );
  });
});
