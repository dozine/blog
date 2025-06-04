import React from "react";
import { jest } from "@jest/globals";

const MockCardList = jest.fn(() => (
  <div data-testid="mock-card-list">Card List Content</div>
));

export default MockCardList;
