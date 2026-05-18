import { an as useSearchParams, u as useNavigate, F as useToast, l as reactExports, bR as getToken, j as jsxRuntimeExports, bu as Logo, Q as Label, I as Input, br as EyeOff, al as Eye, B as Button, L as LoaderCircle, bv as setToken, C as CircleAlert, aC as Mail, ag as User, aw as ShieldCheck } from "./index-C4ZP3eFM.js";
import { v as validateAuthorize, a as approveAuthorize } from "./ssoService-7sYlG21c.js";
import { G as Globe } from "./globe-CuQXKfU6.js";
const SCOPE_LABELS = {
  openid: { label: "Identity", description: "Know who you are", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }) },
  profile: { label: "Profile", description: "Access your name and profile picture", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) },
  email: { label: "Email address", description: "Access your email address", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }) }
};
function SSOAuthorize() {
  const [searchParams] = useSearchParams();
  useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = reactExports.useState(null);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [loginLoading, setLoginLoading] = reactExports.useState(false);
  const [clientInfo, setClientInfo] = reactExports.useState(null);
  const [loadError, setLoadError] = reactExports.useState(null);
  const [authorizing, setAuthorizing] = reactExports.useState(false);
  const [validating, setValidating] = reactExports.useState(false);
  const oauthParams = {
    client_id: searchParams.get("client_id") ?? "",
    redirect_uri: searchParams.get("redirect_uri") ?? "",
    response_type: searchParams.get("response_type") ?? "code",
    scope: searchParams.get("scope") ?? "openid",
    state: searchParams.get("state") ?? "",
    code_challenge: searchParams.get("code_challenge") ?? "",
    code_challenge_method: searchParams.get("code_challenge_method") ?? ""
  };
  reactExports.useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);
  reactExports.useEffect(() => {
    if (isAuthenticated !== true) return;
    if (!oauthParams.client_id || !oauthParams.redirect_uri) {
      setLoadError("Missing required OAuth parameters (client_id, redirect_uri).");
      return;
    }
    setValidating(true);
    const params = {};
    Object.entries(oauthParams).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    validateAuthorize(params).then(setClientInfo).catch((err) => {
      const msg = err.response?.data?.error ?? "Invalid authorization request.";
      setLoadError(msg);
    }).finally(() => setValidating(false));
  }, [isAuthenticated]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      if (data.two_factor) {
        toast({ title: "Two-factor required", description: "Please log in via the main app first, then return here.", variant: "destructive" });
        return;
      }
      setToken(data.token);
      setIsAuthenticated(true);
    } catch (err) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };
  const handleDecision = async (approved) => {
    setAuthorizing(true);
    try {
      const payload = {
        client_id: oauthParams.client_id,
        redirect_uri: oauthParams.redirect_uri,
        scope: oauthParams.scope,
        approved
      };
      if (oauthParams.state) payload.state = oauthParams.state;
      if (oauthParams.code_challenge) payload.code_challenge = oauthParams.code_challenge;
      if (oauthParams.code_challenge_method) payload.code_challenge_method = oauthParams.code_challenge_method;
      const { redirect_to } = await approveAuthorize(payload);
      window.location.href = redirect_to;
    } catch (err) {
      toast({ title: "Authorization failed", description: err.response?.data?.error ?? err.message, variant: "destructive" });
      setAuthorizing(false);
    }
  };
  if (!oauthParams.client_id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorScreen, { message: "Missing client_id parameter." });
  }
  if (isAuthenticated === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  }
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: Logo, alt: "Aurai", className: "h-10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold text-center text-slate-900 dark:text-white mb-1", children: "Sign in to continue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-center text-slate-500 dark:text-slate-400 mb-6", children: "An application is requesting access to your Aurai account." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "you@company.com",
              required: true,
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "password",
                type: showPassword ? "text" : "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "••••••••",
                required: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600",
                children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: loginLoading, children: [
          loginLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null,
          "Sign in"
        ] })
      ] })
    ] }) });
  }
  if (validating) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  if (loadError) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorScreen, { message: loadError });
  if (!clientInfo) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  clientInfo.scopes.filter((s) => s !== "openid");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-4 mb-6", children: [
        clientInfo.client.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: clientInfo.client.logo_url, alt: clientInfo.client.name, className: "h-12 w-12 rounded-xl object-contain border border-slate-200 dark:border-slate-700 p-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-6 w-6 text-slate-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-400 dark:text-slate-500 text-2xl font-light", children: "↔" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: Logo, alt: "Aurai", className: "h-10" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-semibold text-center text-slate-900 dark:text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: clientInfo.client.name }),
        " is requesting access"
      ] }),
      clientInfo.client.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-center text-slate-500 dark:text-slate-400 mt-1", children: clientInfo.client.description }),
      clientInfo.client.homepage_url && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: clientInfo.client.homepage_url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "block text-xs text-center text-primary hover:underline mt-1",
          children: clientInfo.client.homepage_url
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3", children: "This application will be able to:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: Object.entries(SCOPE_LABELS).filter(([key]) => clientInfo.scopes.includes(key)).map(([key, { label, description, icon }]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 text-primary", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-800 dark:text-slate-200", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 dark:text-slate-400", children: [
            " — ",
            description
          ] })
        ] })
      ] }, key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs text-slate-400 dark:text-slate-500", children: [
        "Authorizing will redirect you to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs", children: new URL(clientInfo.redirect_uri).hostname }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 pb-8 flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          className: "flex-1",
          onClick: () => handleDecision(false),
          disabled: authorizing,
          children: "Deny"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "flex-1",
          onClick: () => handleDecision(true),
          disabled: authorizing,
          children: [
            authorizing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null,
            "Allow access"
          ]
        }
      )
    ] })
  ] }) });
}
function LoadingScreen() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) });
}
function ErrorScreen({ message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-900 p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-10 w-10 text-red-500 mx-auto mb-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-slate-900 dark:text-white mb-1", children: "Authorization Error" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: message })
  ] }) });
}
export {
  SSOAuthorize as default
};
