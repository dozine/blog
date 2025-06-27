import "@testing-library/jest-dom";
import { server } from "./__mocks__/server";
import "whatwg-fetch";
import "@testing-library/jest-dom";

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "warn",
  });
});

afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});

afterAll(() => {
  server.close();
});
