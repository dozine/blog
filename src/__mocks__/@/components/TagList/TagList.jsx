import React from "react";
import { jest } from "@jest/globals";

const MockTagList = jest.fn((props) => {
  const tags = props.selectedTags || [];

  return (
    <div data-testid="mock-tag-list">
      {tags.map((tag) => (
        <span key={tag} data-testid={`mock-tag-${tag}`}>
          {tag}
        </span>
      ))}
      {/* 테스트에서 사용할 버튼들 추가 */}
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
