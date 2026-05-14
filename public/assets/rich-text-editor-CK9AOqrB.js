import { ad as createLucideIcon, l as reactExports, j as jsxRuntimeExports, B as Button, z as cn } from "./index-C4ZP3eFM.js";
import { B as Bold, I as Italic, L as List, a as ListOrdered } from "./list-CgjYpKvJ.js";
const Heading1 = createLucideIcon("Heading1", [
  ["path", { d: "M4 12h8", key: "17cfdx" }],
  ["path", { d: "M4 18V6", key: "1rz3zl" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }],
  ["path", { d: "m17 12 3-2v8", key: "1hhhft" }]
]);
const Heading2 = createLucideIcon("Heading2", [
  ["path", { d: "M4 12h8", key: "17cfdx" }],
  ["path", { d: "M4 18V6", key: "1rz3zl" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }],
  ["path", { d: "M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1", key: "9jr5yi" }]
]);
const Strikethrough = createLucideIcon("Strikethrough", [
  ["path", { d: "M16 4H9a3 3 0 0 0-2.83 4", key: "43sutm" }],
  ["path", { d: "M14 12a4 4 0 0 1 0 8H6", key: "nlfj13" }],
  ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }]
]);
function RichTextEditor({
  className,
  value,
  onChange,
  placeholder,
  disabled = false,
  ...props
}) {
  const editorRef = reactExports.useRef(null);
  const isInternalUpdate = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML && !isInternalUpdate.current) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);
  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      if (html === "<br>" || html.trim() === "") {
        onChange("");
      } else {
        onChange(html);
      }
      setTimeout(() => isInternalUpdate.current = false, 0);
    }
  };
  const execCommand = (command, value2 = void 0) => {
    document.execCommand(command, false, value2);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-col border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 p-1 bg-muted/50 border-b", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("bold");
          },
          title: "Bold",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bold, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("italic");
          },
          title: "Italic",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Italic, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("strikeThrough");
          },
          title: "Strikethrough",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Strikethrough, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-border mx-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("insertUnorderedList");
          },
          title: "Bullet List",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("insertOrderedList");
          },
          title: "Numbered List",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListOrdered, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-border mx-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("formatBlock", "H3");
          },
          title: "Heading",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heading1, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          disabled,
          onClick: (e) => {
            e.preventDefault();
            execCommand("formatBlock", "P");
          },
          title: "Paragraph",
          type: "button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heading2, { className: "h-3 w-3" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: editorRef,
        className: cn(
          "p-3 min-h-[120px] max-h-[300px] overflow-y-auto outline-none prose prose-sm max-w-none dark:prose-invert [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4",
          disabled && "opacity-50 cursor-not-allowed bg-muted/20"
        ),
        contentEditable: !disabled,
        onInput: handleInput,
        spellCheck: false
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        [contenteditable]:empty:before {
          content: "${placeholder || "Enter text..."}";
          color: #9ca3af;
          pointer-events: none;
          display: block; /* For Firefox */
        }
      ` })
  ] });
}
export {
  RichTextEditor as R
};
