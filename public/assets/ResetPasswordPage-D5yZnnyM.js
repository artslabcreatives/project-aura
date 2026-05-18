import { F as useToast, l as reactExports, j as jsxRuntimeExports, bu as Logo, aC as Mail, aq as Lock, Q as Label, I as Input, B as Button, L as LoaderCircle, bn as InputOTP, bp as InputOTPGroup, bq as InputOTPSlot, br as EyeOff, al as Eye, u as useNavigate, bt as loginImage } from "./index-C4ZP3eFM.js";
import { K as KeyRound } from "./key-round-CnvGXgqe.js";
import { A as ArrowLeft } from "./arrow-left-84kdjEmA.js";
function ResetPassword({ onBack }) {
  const { toast } = useToast();
  const [step, setStep] = reactExports.useState("email");
  const [email, setEmail] = reactExports.useState("");
  const [otp, setOtp] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [showNewPassword, setShowNewPassword] = reactExports.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = reactExports.useState(false);
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send verification code");
      }
      toast({
        title: "Code sent",
        description: "Please check your email for the verification code."
      });
      setStep("otp");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      if (otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit code");
      }
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, otp })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid verification code");
      }
      toast({
        title: "Verified",
        description: "Code verified successfully."
      });
      setStep("password");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, otp, password: newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }
      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password."
      });
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-[400px] space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: Logo, alt: "Aura Logo", className: "h-20 w-auto object-contain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2", children: [
        step === "email" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-8 w-8" }),
          " Reset Password"
        ] }),
        step === "otp" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-8 w-8" }),
          " Verify Email"
        ] }),
        step === "password" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-8 w-8" }),
          " New Password"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-500 dark:text-slate-400", children: [
        step === "email" && "Enter your email address and we'll send you a code to reset your password.",
        step === "otp" && `Enter the 6-digit code sent to ${email}`,
        step === "password" && "Create a new strong password for your account."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      step === "email" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSendOtp, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reset-email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "reset-email",
                type: "email",
                placeholder: "name@example.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                className: "pl-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            className: "w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg",
            disabled: isLoading,
            children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Sending Code..."
            ] }) : "Send Verification Code"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: onBack,
            className: "text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1 mx-auto",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
              " Back to Login"
            ]
          }
        ) })
      ] }),
      step === "otp" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          InputOTP,
          {
            maxLength: 6,
            value: otp,
            onChange: (value) => setOtp(value),
            disabled: isLoading,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(InputOTPGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 0, className: "h-12 w-12" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 1, className: "h-12 w-12" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 2, className: "h-12 w-12" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-2 text-muted-foreground", children: "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(InputOTPGroup, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 3, className: "h-12 w-12" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 4, className: "h-12 w-12" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 5, className: "h-12 w-12" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              className: "flex-1 h-11",
              onClick: () => setStep("email"),
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
                "Back"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white",
              onClick: handleVerifyOtp,
              disabled: isLoading || otp.length !== 6,
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
                "Verifying..."
              ] }) : "Verify Code"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "underline hover:text-blue-600",
            onClick: handleSendOtp,
            disabled: isLoading,
            children: "Resend Code"
          }
        ) })
      ] }),
      step === "password" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleResetPassword, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "new-password", children: "New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "new-password",
                type: showNewPassword ? "text" : "password",
                placeholder: "••••••••",
                value: newPassword,
                onChange: (e) => setNewPassword(e.target.value),
                required: true,
                className: "pl-10 pr-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowNewPassword(!showNewPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer z-10",
                "aria-label": showNewPassword ? "Hide password" : "Show password",
                children: showNewPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm-password", children: "Confirm Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "confirm-password",
                type: showConfirmPassword ? "text" : "password",
                placeholder: "••••••••",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                required: true,
                className: "pl-10 pr-10 h-11 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer z-10",
                "aria-label": showConfirmPassword ? "Hide password" : "Show password",
                children: showConfirmPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            className: "w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg",
            disabled: isLoading,
            children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Resetting..."
            ] }) : "Reset Password"
          }
        )
      ] })
    ] })
  ] });
}
function ResetPasswordPage() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:relative lg:flex h-full w-full bg-zinc-900 items-center justify-center p-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 z-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: loginImage,
            alt: "Project Aura Illustration",
            className: "h-full w-full object-cover opacity-90"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mt-auto w-full max-w-lg mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl font-bold text-white mb-4 tracking-tight", children: "Aura Task Management System" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-slate-200 leading-relaxed", children: "Manage your projects, track tasks, and collaborate with your team efficiently in one unified workspace." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-slate-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResetPassword, { onBack: handleBack }) })
  ] });
}
export {
  ResetPasswordPage
};
