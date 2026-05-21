import { useNavigate } from "react-router-dom";
import { ResetPassword } from "@/components/ResetPassword";
import loginImage from "@/assets/login-ui.jpg";

export function ResetPasswordPage() {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Side - Image and Branding */}
            <div className="hidden lg:relative lg:flex h-full w-full bg-zinc-900 items-center justify-center p-12">
                {/* Background Illustration */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginImage}
                        alt="Project Aura Illustration"
                        className="h-full w-full object-cover opacity-90"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                </div>

                {/* Branding Text */}
                <div className="relative z-10 mt-auto w-full max-w-lg mb-12">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Aura Task Management System</h2>
                    <p className="text-lg text-slate-200 leading-relaxed">
                        Manage your projects, track tasks, and collaborate
                        with your team efficiently in one unified workspace.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-slate-950">
                <ResetPassword onBack={handleBack} />
            </div>
        </div>
    );
}
