import { client } from "jest-dynalite"

afterAll(() => {
  client.destroy();
});
