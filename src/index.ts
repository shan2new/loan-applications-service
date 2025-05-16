/**
 * Sample TypeScript file to demonstrate strict TypeScript configuration
 */

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

function getUserInfo(user: User): string {
  const { name, email } = user;
  return `User ${name} can be reached at ${email}`;
}

function processUser(userId: string): void {
  // This would normally fetch a user from a database
  const user: User = {
    id: userId,
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  const info: string = getUserInfo(user);
  console.log(info);
}

export { User, getUserInfo, processUser };
