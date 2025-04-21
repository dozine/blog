import { Quill } from "react-quill-new";

// Import the image resize module
const ImageResize = import("quill-image-resize-module-react").then(
  (module) => module.default || module
);

// Register the module after it's been imported
if (typeof window !== "undefined") {
  ImageResize.then((module) => {
    Quill.register("modules/imageResize", module);
  });
}

const editorModules = {
  toolbar: [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
  imageResize: {
    modules: ["Resize", "DisplaySize"],
  },
};

export default editorModules;
