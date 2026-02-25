import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, SunMedium, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS = [
	{ id: "light", label: "Light", description: "Bright mode" },
	{ id: "dark", label: "Dark", description: "Dimmed mode" },
	{ id: "system", label: "Match System", description: "Use OS preference" },
] as const;

type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

export const ThemeToggle = () => {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const activeTheme = useMemo<ThemeId>(() => {
		if (!mounted) {
			return "light";
		}

		if (theme === "system") {
			return (resolvedTheme as ThemeId) ?? "light";
		}

		return (theme as ThemeId) ?? "light";
	}, [mounted, theme, resolvedTheme]);

	const icon = {
		light: <SunMedium className="h-4 w-4" />,
		dark: <Moon className="h-4 w-4" />,
		system: <Monitor className="h-4 w-4" />,
	}[mounted ? (theme as ThemeId) ?? "light" : "light"];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="hidden md:inline-flex items-center justify-center border-border/70 hover:bg-accent/40 rounded-full"
				>
					<span className="sr-only">Toggle color theme</span>
					<span className="relative flex h-5 w-5 items-center justify-center text-primary">
						<SunMedium
							className={`absolute transition-all duration-300 ${activeTheme === "dark" ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
						/>
						<Moon
							className={`absolute transition-all duration-300 ${activeTheme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
						/>
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				<DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-widest">
					Theme
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{THEME_OPTIONS.map((option) => (
					<DropdownMenuItem
						key={option.id}
						onClick={() => setTheme(option.id)}
						className={`flex flex-col items-start gap-0.5 py-2 text-sm ${activeTheme === option.id ? "bg-primary/10 text-primary" : ""
							}`}
					>
						<div className="flex w-full items-center justify-between">
							<span>{option.label}</span>
							{option.id === "light" && <SunMedium className="h-4 w-4" />}
							{option.id === "dark" && <Moon className="h-4 w-4" />}
							{option.id === "system" && <Monitor className="h-4 w-4" />}
						</div>
						<span className="text-xs text-muted-foreground">{option.description}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
