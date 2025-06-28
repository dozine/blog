// __mocks__/react-quill-new.js
import React from "react";

interface MockReactQuillProps {
  value?: string;
  onChange?: (value: string) => void;
}

const MockReactQuill: React.FC<MockReactQuillProps> = ({ value, onChange, ...props }) => (
  <div data-testid="mock-react-quill">
    <textarea
      data-testid="quill-textarea"
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder="Write your story..."
      {...props}
    />
  </div>
);

const Quill = {
  register: jest.fn(),
};

export default MockReactQuill;
export { Quill };
