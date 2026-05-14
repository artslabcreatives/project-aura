import { j as jsxRuntimeExports } from "./index-C4ZP3eFM.js";
function PublicMattermostChat() {
  const url = "https://collab.artslabcreatives.com/email_login?email=admin@artslabcreatives.com&redirect_to=/artslab-creatives/channels/town-square";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: "100vw", height: "100vh", margin: 0, padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "iframe",
    {
      src: url,
      style: { width: "100%", height: "100%", border: "none" },
      title: "Mattermost Chat",
      allow: "microphone; camera"
    }
  ) });
}
export {
  PublicMattermostChat
};
