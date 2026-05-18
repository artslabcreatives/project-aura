import { v as useUser, l as reactExports, j as jsxRuntimeExports, aD as MessageSquare, B as Button, X } from "./index-C4ZP3eFM.js";
import { M as Maximize2 } from "./maximize-2-BDFf7e8i.js";
function MattermostChat() {
  const { currentUser } = useUser();
  const [autoLoginUrl, setAutoLoginUrl] = reactExports.useState("");
  const [iframeError, setIframeError] = reactExports.useState(false);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    document.title = "Chat - Aura";
    if (currentUser?.email) {
      const email = encodeURIComponent(currentUser.email);
      const redirectTo = encodeURIComponent("/artslab-creatives/channels/town-square");
      const url = `https://collab.artslabcreatives.com/email_login?email=${email}&redirect_to=${redirectTo}`;
      console.log("MattermostChat: Building URL for", email);
      console.log("MattermostChat: URL =", url);
      setAutoLoginUrl(url);
    } else {
      console.log("MattermostChat: No currentUser or email", currentUser);
    }
  }, [currentUser]);
  const handleIframeError = () => {
    console.error("Iframe failed to load");
    setIframeError(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: isFullscreen ? "fixed inset-0 z-50 bg-background flex flex-col" : "flex flex-col h-[calc(100vh-7rem)]", children: [
    isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Chat" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-8 w-8",
          onClick: () => setIsFullscreen(false),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Exit fullscreen" })
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Chat" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "icon",
          onClick: () => setIsFullscreen(true),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Open fullscreen" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: isFullscreen ? "flex-1 overflow-hidden" : "flex-1 border rounded-lg overflow-hidden", children: !autoLoginUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading chat..." }) }) : iframeError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Failed to load Mattermost chat" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "iframe",
      {
        src: autoLoginUrl,
        className: "w-full h-full",
        title: "Chat",
        allow: "microphone; camera",
        onError: handleIframeError
      }
    ) })
  ] });
}
export {
  MattermostChat
};
