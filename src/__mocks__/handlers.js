import { rest } from "msw";

let _tagIdCounter = 3;
let _existingTags = [];

export const resetTagHandlersState = (initialTags) => {
  _tagIdCounter = initialTags.length + 1;
  _existingTags = [...initialTags];
};

export const handlers = [
  rest.post("/api/tags", (req, res, ctx) => {
    const { name } = req.body;

    const lowerCaseName = name.toLowerCase();
    const foundTag = _existingTags.find(
      (tag) => tag.name.toLowerCase() === lowerCaseName
    );

    if (foundTag) {
      return res(
        ctx.status(409),
        ctx.json({ message: "Tag already exists", tag: foundTag })
      );
    }

    const newTag = { id: _tagIdCounter++, name };
    _existingTags.push(newTag);
    return res(ctx.status(201), ctx.json(newTag));
  }),

  rest.get("/api/tags", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(_existingTags));
  }),
];
