import "@testing-library/jest-dom";
import "whatwg-fetch";
import "@testing-library/jest-dom";
import { server } from "./__mocks__/server";

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
