import React from "react";
import { jest } from "@jest/globals";

interface MockTagListProps {
  selectedTags?: string[];
  onTagClick?: (tag: string) => void;
}

const MockTagList = jest.fn((props: MockTagListProps) => {
  const tags = props.selectedTags || [];

  return (
    <div data-testid="mock-tag-list">
      {tags.map((tag) => (
        <span key={tag} data-testid={`mock-tag-${tag}`}>
          {tag}
        </span>
      ))}
      <button
        data-testid="new-tag-button"
        onClick={() => props.onTagClick && props.onTagClick("newTag")}
      >
        Add New Tag
      </button>
      <button
        data-testid="selected-tag-react"
        onClick={() => props.onTagClick && props.onTagClick("react")}
      >
        Remove React
      </button>
    </div>
  );
});

export default MockTagList;
