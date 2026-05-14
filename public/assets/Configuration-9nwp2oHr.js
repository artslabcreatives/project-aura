import { ad as createLucideIcon, bk as j, l as reactExports, j as jsxRuntimeExports, ar as DropdownMenu, as as DropdownMenuTrigger, B as Button, au as DropdownMenuContent, bl as DropdownMenuLabel, bm as DropdownMenuSeparator, av as DropdownMenuItem, ax as api, v as useUser, F as useToast, aw as ShieldCheck, aJ as RefreshCw, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, aR as Copy, bn as InputOTP, bo as Kt, bp as InputOTPGroup, bq as InputOTPSlot, U as DialogFooter, I as Input, br as EyeOff, al as Eye, Y as Badge, bd as Users, aj as FileText, ak as ExternalLink, an as useSearchParams, at as Settings, bs as Bell, aq as Lock, ai as Separator, aC as Mail, aD as MessageSquare, D as userService } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent, e as CardFooter } from "./card-5_9pbgKs.js";
import { S as Switch } from "./switch-DKaAaDNb.js";
import { K as KeyRound } from "./key-round-CnvGXgqe.js";
import { D as Download } from "./download-qf94484n.js";
import { C as CircleCheckBig } from "./circle-check-big-Cwck6DPV.js";
import { C as CircleX } from "./circle-x-BkjZsnQk.js";
import { R as Receipt, D as DollarSign } from "./receipt-BPWO68lI.js";
import "./index-D6Uc8srH.js";
const Monitor = createLucideIcon("Monitor", [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
]);
const Moon = createLucideIcon("Moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
const Palette = createLucideIcon("Palette", [
  ["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }],
  ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }],
  ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }],
  ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }],
  [
    "path",
    {
      d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",
      key: "12rzf8"
    }
  ]
]);
const ShieldAlert = createLucideIcon("ShieldAlert", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
]);
const Smartphone = createLucideIcon("Smartphone", [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
]);
const SunMedium = createLucideIcon("SunMedium", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 3v1", key: "1asbbs" }],
  ["path", { d: "M12 20v1", key: "1wcdkc" }],
  ["path", { d: "M3 12h1", key: "lp3yf2" }],
  ["path", { d: "M20 12h1", key: "1vloll" }],
  ["path", { d: "m18.364 5.636-.707.707", key: "1hakh0" }],
  ["path", { d: "m6.343 17.657-.707.707", key: "18m9nf" }],
  ["path", { d: "m5.636 5.636.707.707", key: "1xv1c5" }],
  ["path", { d: "m17.657 17.657.707.707", key: "vl76zb" }]
]);
const THEME_OPTIONS = [
  { id: "light", label: "Light", description: "Bright mode" },
  { id: "dark", label: "Dark", description: "Dimmed mode" },
  { id: "system", label: "Match System", description: "Use OS preference" }
];
const ThemeToggle = () => {
  const { theme, resolvedTheme, setTheme } = j();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  const activeTheme = reactExports.useMemo(() => {
    if (!mounted) {
      return "light";
    }
    if (theme === "system") {
      return resolvedTheme ?? "light";
    }
    return theme ?? "light";
  }, [mounted, theme, resolvedTheme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "hidden md:inline-flex items-center justify-center border-border/70 hover:bg-accent/40 rounded-full",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle color theme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-5 w-5 items-center justify-center text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SunMedium,
              {
                className: `absolute transition-all duration-300 ${activeTheme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Moon,
              {
                className: `absolute transition-all duration-300 ${activeTheme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-52", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "text-xs text-muted-foreground uppercase tracking-widest", children: "Theme" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      THEME_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onClick: () => setTheme(option.id),
          className: `flex flex-col items-start gap-0.5 py-2 text-sm ${activeTheme === option.id ? "bg-primary/10 text-primary" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: option.label }),
              option.id === "light" && /* @__PURE__ */ jsxRuntimeExports.jsx(SunMedium, { className: "h-4 w-4" }),
              option.id === "dark" && /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" }),
              option.id === "system" && /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-4 w-4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: option.description })
          ]
        },
        option.id
      ))
    ] })
  ] });
};
const twoFactorService = {
  enable: async () => {
    return api.post("/two-factor/enable", {});
  },
  confirm: async (code) => {
    return api.post("/two-factor/confirm", { code });
  },
  disable: async (password) => {
    return api.post("/two-factor/disable", { password });
  },
  getRecoveryCodes: async (password) => {
    return api.post("/two-factor/recovery-codes", { password });
  },
  regenerateRecoveryCodes: async (password) => {
    return api.post("/two-factor/recovery-codes/regenerate", { password });
  }
};
function TwoFactorSection() {
  const { currentUser, refreshUser } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [showEnableDialog, setShowEnableDialog] = reactExports.useState(false);
  const [showRecoveryCodesDialog, setShowRecoveryCodesDialog] = reactExports.useState(false);
  const [showConfirmPasswordDialog, setShowConfirmPasswordDialog] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [passwordAction, setPasswordAction] = reactExports.useState("disable");
  const [setupData, setSetupData] = reactExports.useState(null);
  const [confirmCode, setConfirmCode] = reactExports.useState("");
  const [recoveryCodes, setRecoveryCodes] = reactExports.useState([]);
  const [passwordConfirm, setPasswordConfirm] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!showConfirmPasswordDialog) {
      setPasswordConfirm("");
      setShowPassword(false);
    }
  }, [showConfirmPasswordDialog]);
  if (!currentUser) return null;
  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const data = await twoFactorService.enable();
      setSetupData(data);
      setShowEnableDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to start 2FA setup.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleConfirm2FA = async () => {
    setIsLoading(true);
    try {
      const response = await twoFactorService.confirm(confirmCode);
      await refreshUser();
      setShowEnableDialog(false);
      setRecoveryCodes(response.recovery_codes);
      setShowRecoveryCodesDialog(true);
      setConfirmCode("");
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled."
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handlePasswordSubmit = async () => {
    setIsLoading(true);
    try {
      if (passwordAction === "disable") {
        await twoFactorService.disable(passwordConfirm);
        await refreshUser();
        toast({ title: "Success", description: "Two-factor authentication disabled." });
      } else if (passwordAction === "showCodes") {
        const response = await twoFactorService.getRecoveryCodes(passwordConfirm);
        setRecoveryCodes(response.recovery_codes);
        setShowRecoveryCodesDialog(true);
      } else if (passwordAction === "regenerate") {
        const response = await twoFactorService.regenerateRecoveryCodes(passwordConfirm);
        setRecoveryCodes(response.recovery_codes);
        setShowRecoveryCodesDialog(true);
        toast({ title: "Success", description: "Recovery codes regenerated." });
      }
      setShowConfirmPasswordDialog(false);
      setPasswordConfirm("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Incorrect password or action failed.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const openConfirmPassword = (action) => {
    setPasswordAction(action);
    setShowConfirmPasswordDialog(true);
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard" });
  };
  const downloadRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-primary" }),
        "Two-Factor Authentication"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Add an extra layer of security to your account using TOTP apps (like Google Authenticator)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-full ${currentUser.twoFactorEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-slate-100 dark:bg-slate-800"}`, children: currentUser.twoFactorEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-6 w-6 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-6 w-6 text-slate-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-base", children: currentUser.twoFactorEnabled ? "2FA is enabled" : "2FA is not enabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 text-pretty max-w-sm", children: currentUser.twoFactorEnabled ? "Your account is protected with two-factor authentication." : "Secure your account by requiring an authentication code when logging in." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: currentUser.twoFactorEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => openConfirmPassword("disable"), disabled: isLoading, children: "Disable 2FA" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleEnable2FA, disabled: isLoading, children: "Enable 2FA" }) })
      ] }),
      currentUser.twoFactorEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => openConfirmPassword("showCodes"), disabled: isLoading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "mr-2 h-4 w-4" }),
          "Show Recovery Codes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => openConfirmPassword("regenerate"), disabled: isLoading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-2 h-4 w-4" }),
          "Regenerate Recovery Codes"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showEnableDialog, onOpenChange: setShowEnableDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enable Two-Factor Authentication" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)." })
        ] }),
        setupData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center p-4 bg-white rounded-lg border w-fit mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dangerouslySetInnerHTML: { __html: setupData.qr_code_url } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Or enter this code manually:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-muted p-2 rounded text-sm font-mono flex-1 text-center", children: setupData.secret }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => copyToClipboard(setupData.secret), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Enter the 6-digit code from your app" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              InputOTP,
              {
                maxLength: 6,
                value: confirmCode,
                onChange: setConfirmCode,
                pattern: Kt,
                render: ({ slots }) => /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPGroup, { children: slots.map((slot, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index, ...slot }, index)) })
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowEnableDialog(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleConfirm2FA, disabled: !confirmCode || confirmCode.length !== 6 || isLoading, children: isLoading ? "Verifying..." : "Verify & Enable" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showRecoveryCodesDialog, onOpenChange: setShowRecoveryCodesDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Recovery Codes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Save these codes in a secure place. You can use them to access your account if you lose your authentication device." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted p-4 rounded-lg grid grid-cols-2 gap-4 text-center font-mono text-sm", children: recoveryCodes.map((code, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-background p-3 rounded border shadow-sm", children: code }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: downloadRecoveryCodes, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
            "Download"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
            const text = recoveryCodes.join("\n");
            copyToClipboard(text);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-2 h-4 w-4" }),
            "Copy All"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowRecoveryCodesDialog(false), children: "Done" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showConfirmPasswordDialog, onOpenChange: setShowConfirmPasswordDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirm Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Please enter your password to confirm this action." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm-password", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "confirm-password",
                type: showPassword ? "text" : "password",
                value: passwordConfirm,
                onChange: (e) => setPasswordConfirm(e.target.value),
                placeholder: "••••••••",
                className: "pr-10"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground",
                onClick: () => setShowPassword(!showPassword),
                children: [
                  showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: showPassword ? "Hide password" : "Show password" })
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowConfirmPasswordDialog(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handlePasswordSubmit, disabled: !passwordConfirm || isLoading, children: isLoading ? "Confirming..." : "Confirm" })
        ] })
      ] }) })
    ] })
  ] });
}
function XeroIntegration() {
  const [status, setStatus] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [syncing, setSyncing] = reactExports.useState(false);
  const [syncingClients, setSyncingClients] = reactExports.useState(false);
  const [syncingInvoices, setSyncingInvoices] = reactExports.useState(false);
  const { toast } = useToast();
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get("/xero/status");
      setStatus(response);
    } catch (error) {
      console.error("Failed to fetch Xero status:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleConnect = async () => {
    try {
      const response = await api.get("/xero/auth-url");
      window.location.href = response.url;
    } catch (error) {
      console.error("Failed to get Xero auth URL:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Xero",
        variant: "destructive"
      });
    }
  };
  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post("/xero/sync", {});
      await fetchStatus();
      toast({
        title: "Success",
        description: `Synced ${response.created} new estimates and updated ${response.updated} existing ones`
      });
    } catch (error) {
      console.error("Failed to sync with Xero:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to sync estimates",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };
  const handleSyncClients = async () => {
    try {
      setSyncingClients(true);
      const response = await api.post("/xero/sync-clients", {});
      await fetchStatus();
      toast({
        title: "Success",
        description: `Clients synced — ${response.created} created, ${response.merged} auto-merged`
      });
    } catch (error) {
      console.error("Failed to sync clients from Xero:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to sync clients",
        variant: "destructive"
      });
    } finally {
      setSyncingClients(false);
    }
  };
  const handleSyncInvoices = async () => {
    try {
      setSyncingInvoices(true);
      const response = await api.post("/xero/sync-invoices", {});
      await fetchStatus();
      toast({
        title: "Success",
        description: `Synced ${response.synced} invoices from Xero`
      });
    } catch (error) {
      console.error("Failed to sync invoices with Xero:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to sync invoices",
        variant: "destructive"
      });
    } finally {
      setSyncingInvoices(false);
    }
  };
  reactExports.useEffect(() => {
    fetchStatus();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Xero Integration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Loading..." })
    ] }) });
  }
  const isBusy = syncing || syncingClients || syncingInvoices;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Xero Integration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Sync invoices with Xero accounting system" })
      ] }),
      status?.connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "default", className: "bg-green-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "mr-1 h-3 w-3" }),
        "Connected"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-1 h-3 w-3" }),
        "Not Connected"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      status?.connected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        status.tenantId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tenant ID:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
            status.tenantId.substring(0, 12),
            "..."
          ] })
        ] }),
        status.lastSyncedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Last Synced:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(status.lastSyncedAt).toLocaleString() })
        ] }),
        status.tokenExpiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Token Expires:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(status.tokenExpiresAt).toLocaleString() })
        ] })
      ] }),
      !status?.connected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Connect your Xero account to automatically sync estimates and invoices." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardFooter, { className: "flex gap-2 flex-wrap", children: status?.connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSyncClients, disabled: isBusy, className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: `mr-2 h-4 w-4 ${syncingClients ? "animate-spin" : ""}` }),
        syncingClients ? "Syncing Clients..." : "Sync Clients"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSync, disabled: isBusy, className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: `mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}` }),
        syncing ? "Syncing Estimates..." : "Sync Estimates"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSyncInvoices, disabled: isBusy, className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: `mr-2 h-4 w-4 ${syncingInvoices ? "animate-spin" : ""}` }),
        syncingInvoices ? "Syncing Invoices..." : "Sync Invoices"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleConnect, variant: "outline", className: "w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "mr-2 h-4 w-4" }),
        "Reconnect"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleConnect, className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "mr-2 h-4 w-4" }),
      "Connect to Xero"
    ] }) })
  ] });
}
function Configuration() {
  const { currentUser, refreshUser, activeRole } = useUser();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const appearanceRef = reactExports.useRef(null);
  const notificationsRef = reactExports.useRef(null);
  const securityRef = reactExports.useRef(null);
  const integrationsRef = reactExports.useRef(null);
  const [notifications, setNotifications] = reactExports.useState({
    email: true,
    push: true,
    whatsapp: false,
    mattermost: false
  });
  const [reducedMotion, setReducedMotion] = reactExports.useState(false);
  const [passwords, setPasswords] = reactExports.useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPasswords, setShowPasswords] = reactExports.useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (currentUser?.preferences) {
      if (currentUser.preferences.notifications) {
        setNotifications(currentUser.preferences.notifications);
      }
      if (currentUser.preferences.reducedMotion !== void 0) {
        setReducedMotion(currentUser.preferences.reducedMotion);
      }
    }
  }, [currentUser]);
  reactExports.useEffect(() => {
    const section = searchParams.get("section");
    const xero = searchParams.get("xero");
    if (section === "integrations") {
      setTimeout(() => integrationsRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    }
    if (xero === "connected") {
      toast({ title: "Xero Connected", description: "Your Xero account has been connected successfully." });
      setSearchParams({}, { replace: true });
    } else if (xero === "error") {
      const reason = searchParams.get("reason") || "unknown";
      toast({ title: "Xero Connection Failed", description: `Error: ${reason}`, variant: "destructive" });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleNotificationChange = async (key) => {
    let newSettings = { ...notifications, [key]: !notifications[key] };
    if (key === "push" && newSettings.push) {
      if (!("Notification" in window)) {
        toast({
          title: "Not Supported",
          description: "This browser does not support desktop notifications.",
          variant: "destructive"
        });
        return;
      }
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          newSettings = { ...notifications, push: false };
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive"
          });
        }
      }
    }
    setNotifications(newSettings);
    if (currentUser) {
      try {
        await userService.update(currentUser.id, {
          preferences: {
            notifications: newSettings,
            reducedMotion
          }
        });
        await refreshUser();
        toast({
          title: "Settings Updated",
          description: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${newSettings[key] ? "enabled" : "disabled"}.`
        });
      } catch (error) {
        console.error("Failed to save settings", error);
        setNotifications(notifications);
        toast({
          title: "Error",
          description: "Failed to save settings to database.",
          variant: "destructive"
        });
      }
    }
  };
  const handleMotionChange = async (checked) => {
    setReducedMotion(checked);
    if (currentUser) {
      try {
        await userService.update(currentUser.id, {
          preferences: {
            notifications,
            reducedMotion: checked
          }
        });
        await refreshUser();
        toast({
          title: "Settings Updated",
          description: `Reduced motion ${checked ? "enabled" : "disabled"}.`
        });
      } catch (error) {
        console.error("Failed to save settings", error);
        setReducedMotion(!checked);
        toast({
          title: "Error",
          description: "Failed to save settings to database.",
          variant: "destructive"
        });
      }
    }
  };
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    if (passwords.new.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post("/change-password", {
        current_password: passwords.current,
        new_password: passwords.new,
        new_password_confirmation: passwords.confirm
      });
      toast({
        title: "Success",
        description: "Password updated successfully."
      });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to change password";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };
  const togglePasswordVisibility = (key) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 fade-in h-[calc(100vh-6rem)] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2 flex-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage your account settings and preferences." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 md:grid-cols-[250px_1fr] flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden md:flex flex-col gap-2 h-full overflow-y-auto pr-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            className: "justify-start hover:bg-accent/50",
            onClick: () => scrollToSection(appearanceRef),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "mr-2 h-4 w-4" }),
              " Appearance"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            className: "justify-start hover:bg-accent/50",
            onClick: () => scrollToSection(notificationsRef),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "mr-2 h-4 w-4" }),
              " Notifications"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            className: "justify-start hover:bg-accent/50",
            onClick: () => scrollToSection(securityRef),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-2 h-4 w-4" }),
              " Security"
            ]
          }
        ),
        (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            className: "justify-start hover:bg-accent/50",
            onClick: () => scrollToSection(integrationsRef),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "mr-2 h-4 w-4" }),
              " Integrations"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 h-full overflow-y-auto pr-6 pb-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: appearanceRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-5 w-5 text-primary" }),
              "Appearance"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Customize how the application looks for you." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "Theme" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Select your preferred color theme." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "Reduced Motion" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Minimize animations in the UI." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: reducedMotion,
                  onCheckedChange: handleMotionChange
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: notificationsRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-primary" }),
              "Notifications"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure how you receive alerts." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "Email Notifications" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Receive summary emails about your tasks." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: notifications.email,
                  onCheckedChange: () => handleNotificationChange("email")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "Desktop Push Notifications" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Get real-time browser alerts." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: notifications.push,
                  onCheckedChange: () => handleNotificationChange("push")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "WhatsApp Notifications" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Receive urgent updates via WhatsApp." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: notifications.whatsapp,
                  onCheckedChange: () => handleNotificationChange("whatsapp")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "Mattermost Notifications" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Get updates in your team's Mattermost channel." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: notifications.mattermost,
                  onCheckedChange: () => handleNotificationChange("mattermost")
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: securityRef, className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5 text-primary" }),
                "Security"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Manage your password and account security." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePasswordChange, className: "space-y-4 max-w-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "current-password", children: "Current Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "current-password",
                      type: showPasswords.current ? "text" : "password",
                      value: passwords.current,
                      onChange: (e) => setPasswords((prev) => ({ ...prev, current: e.target.value })),
                      required: true
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
                      onClick: () => togglePasswordVisibility("current"),
                      children: [
                        showPasswords.current ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle password visibility" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "new-password", children: "New Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "new-password",
                      type: showPasswords.new ? "text" : "password",
                      value: passwords.new,
                      onChange: (e) => setPasswords((prev) => ({ ...prev, new: e.target.value })),
                      required: true,
                      minLength: 8
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
                      onClick: () => togglePasswordVisibility("new"),
                      children: [
                        showPasswords.new ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle password visibility" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm-password", children: "Confirm New Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "confirm-password",
                      type: showPasswords.confirm ? "text" : "password",
                      value: passwords.confirm,
                      onChange: (e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value })),
                      required: true,
                      minLength: 8
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
                      onClick: () => togglePasswordVisibility("confirm"),
                      children: [
                        showPasswords.confirm ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Toggle password visibility" })
                      ]
                    }
                  )
                ] }),
                passwords.new && passwords.confirm && passwords.new !== passwords.confirm && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500", children: "Passwords do not match" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: passwordLoading, children: passwordLoading ? "Updating..." : "Update Password" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TwoFactorSection, {})
        ] }),
        (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: integrationsRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-primary" }),
              "Financial Integrations"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Connect and sync with external accounting systems." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(XeroIntegration, {}) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Configuration as default
};
