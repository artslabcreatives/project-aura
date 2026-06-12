import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import {
	Monitor,
	Smartphone,
	Download,
	Copy,
	Check,
	ExternalLink,
	ArrowRight,
	ChevronRight,
	Laptop,
	Terminal,
	ShieldCheck,
	ArrowLeft,
	Info,
	Server
} from "lucide-react";
import { toast } from "sonner";

type Platform = "windows" | "mac" | "linux" | "android" | "ios" | "unknown";

function AppleIcon({ className = "h-5 w-5" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg">
			<path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5M15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C15.85 1.04 14.51 1.73 13.73 2.64C13.07 3.41 12.49 4.52 12.64 5.78C13.87 5.87 15.12 5.17 15.97 4.17Z" />
		</svg>
	);
}

function AndroidIcon({ className = "h-5 w-5" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={`${className} fill-current`} xmlns="http://www.w3.org/2000/svg">
			<path d="M17.523 15.3l1.816 3.146a.5.5 0 0 1-.183.683.5.5 0 0 1-.683-.183L16.63 15.75c-1.353.628-2.906.97-4.63.97s-3.277-.342-4.63-.97l-1.826 3.167a.5.5 0 0 1-.683.183.5.5 0 0 1-.183-.683l1.816-3.146C4.013 13.518 2.378 11.026 2.052 8h19.896c-.326 3.026-1.961 5.518-4.425 7.3zM15.5 11a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-7 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
		</svg>
	);
}

export default function DownloadMattermost() {
	const { isAuthenticated } = useUser();
	const navigate = useNavigate();
	const [detectedOS, setDetectedOS] = useState<Platform>("unknown");
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<string>("desktop");

	// Auto-detect OS on load
	useEffect(() => {
		const userAgent = window.navigator.userAgent.toLowerCase();
		let os: Platform = "unknown";

		if (userAgent.indexOf("win") !== -1) {
			os = "windows";
			setActiveTab("desktop");
		} else if (userAgent.indexOf("mac") !== -1) {
			// Check if iPad / iOS
			if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
				os = "ios";
				setActiveTab("mobile");
			} else {
				os = "mac";
				setActiveTab("desktop");
			}
		} else if (userAgent.indexOf("linux") !== -1) {
			os = "linux";
			setActiveTab("desktop");
		} else if (userAgent.indexOf("android") !== -1) {
			os = "android";
			setActiveTab("mobile");
		} else if (userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1 || userAgent.indexOf("ipod") !== -1) {
			os = "ios";
			setActiveTab("mobile");
		}

		setDetectedOS(os);
	}, []);

	// Get server URL to copy (defaults to aura staging server URL or current domain)
	const serverUrl = "collab.artslabcreatives.com";

	const handleCopyServerUrl = () => {
		navigator.clipboard.writeText(serverUrl);
		setCopied(true);
		toast.success("Server URL copied to clipboard!", {
			description: serverUrl,
		});
		setTimeout(() => setCopied(false), 3000);
	};

	const getOSLabel = (os: Platform) => {
		switch (os) {
			case "windows": return "Windows (PC)";
			case "mac": return "macOS (Mac)";
			case "linux": return "Linux (Debian/RPM)";
			case "android": return "Android Device";
			case "ios": return "iPhone / iPad (iOS)";
			default: return "";
		}
	};

	const getPrimaryDownloadLink = (os: Platform) => {
		switch (os) {
			case "windows":
				return "https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-win-x64.msi";
			case "mac":
				return "https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-mac-universal.dmg";
			case "linux":
				return "https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-linux-x64.tar.gz";
			case "android":
				return "https://play.google.com/store/apps/details?id=com.mattermost.rn";
			case "ios":
				return "https://apps.apple.com/lk/app/mattermost/id1257222717";
			default:
				return "https://mattermost.com/download/";
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 relative overflow-hidden">
			{/* Decorative background grid and meshes */}
			<div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] bg-[size:30px_30px] pointer-events-none z-0" />
			<div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
			<div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0" />

			{/* Navigation Header */}
			<header className="z-10 w-full border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 transition-all duration-300">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link to={isAuthenticated ? "/" : "#"} className="flex items-center gap-2 group">
							<img src={Logo} alt="Aura Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
							<span className="font-semibold text-lg tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
								Aura
							</span>
						</Link>
					</div>

					<div className="flex items-center gap-4">
						{isAuthenticated ? (
							<Button
								variant="outline"
								size="sm"
								className="gap-2 border-border/80 hover:bg-accent/50 text-xs sm:text-sm shadow-sm transition-all hover:translate-x-[-2px]"
								onClick={() => navigate("/")}
								id="btn_back_to_dashboard"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Dashboard
							</Button>
						) : (
							<Button
								variant="default"
								size="sm"
								className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm shadow-md transition-all hover:translate-y-[-1px]"
								onClick={() => navigate("/")}
								id="btn_sign_in"
							>
								Sign In to Aura
							</Button>
						)}
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center">

				{/* OS Auto-detection Alert / Hero banner */}
				<div className="w-full text-center space-y-4 max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm animate-pulse-slow">
						<ShieldCheck className="h-3.5 w-3.5" />
						Official Secure Mattermost Downloads
					</div>
					<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-display text-slate-900 dark:text-white leading-tight">
						Stay Connected with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500 dark:from-primary dark:to-secondary-light">Mattermost</span>
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Collaborate securely, share files, and message your team in real time. Download the official Mattermost app for all your devices.
					</p>

					{/* Auto-detected Platform Widget */}
					{detectedOS !== "unknown" && (
						<div className="mt-8 p-4 rounded-xl glass border border-primary/10 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-primary/20 transition-all">
							<div className="flex items-center gap-3 text-left">
								<div className="p-2.5 rounded-lg bg-primary/10 text-primary">
									{detectedOS === "windows" || detectedOS === "linux" || detectedOS === "mac" ? (
										<Monitor className="h-6 w-6" />
									) : (
										<Smartphone className="h-6 w-6" />
									)}
								</div>
								<div>
									<div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Detected System</div>
									<div className="font-semibold text-slate-800 dark:text-slate-100">{getOSLabel(detectedOS)}</div>
								</div>
							</div>
							<Button
								asChild
								className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 group"
								id="btn_auto_download"
							>
								<a href={getPrimaryDownloadLink(detectedOS)} target="_blank" rel="noopener noreferrer">
									<Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
									Download for {detectedOS.charAt(0).toUpperCase() + detectedOS.slice(1)}
								</a>
							</Button>
						</div>
					)}
				</div>

				{/* Server URL Config Helper (Very Important!) */}
				<div className="w-full max-w-4xl mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
					<Card className="glass border-border/50 shadow-md overflow-hidden relative">
						<div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-sky-500" />
						<CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
							<div className="space-y-2 text-left flex-1">
								<div className="flex items-center gap-2 text-primary">
									<Server className="h-5 w-5" />
									<span className="font-semibold text-sm uppercase tracking-wider">Aura Server Connection</span>
								</div>
								<h3 className="text-xl font-bold text-slate-900 dark:text-white">Required Server URL</h3>
								<p className="text-sm text-muted-foreground max-w-xl">
									When opening Mattermost for the first time, you will be prompted for your **Server URL**. Enter the address below to connect directly to the Aura network.
								</p>
							</div>
							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
								<div className="flex items-center justify-between bg-accent/30 dark:bg-accent/10 border border-border/60 rounded-lg px-4 h-11 text-sm font-mono text-slate-700 dark:text-slate-200 select-all min-w-[240px] shadow-inner">
									{serverUrl}
								</div>
								<Button
									onClick={handleCopyServerUrl}
									variant={copied ? "default" : "outline"}
									className={`h-11 px-4 gap-2 transition-all active:scale-95 ${copied ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : 'border-border/80 hover:bg-accent/40'}`}
									id="btn_copy_server_url"
								>
									{copied ? (
										<>
											<Check className="h-4 w-4" />
											Copied!
										</>
									) : (
										<>
											<Copy className="h-4 w-4" />
											Copy URL
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Downloads Grid with Tabs */}
				<div className="w-full max-w-4xl mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<div className="flex justify-center mb-8">
							<TabsList className="bg-muted/60 dark:bg-muted/30 border border-border/50 p-1 rounded-xl glass shadow-sm">
								<TabsTrigger
									value="desktop"
									className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm"
									id="tab_desktop"
								>
									<Laptop className="h-4 w-4 mr-2" />
									Desktop Apps (PC/Mac/Linux)
								</TabsTrigger>
								<TabsTrigger
									value="mobile"
									className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm"
									id="tab_mobile"
								>
									<Smartphone className="h-4 w-4 mr-2" />
									Mobile Apps (iOS/Android)
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Desktop Clients Panel */}
						<TabsContent value="desktop" className="outline-none">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

								{/* Windows Card */}
								<Card className="glass border-border/40 hover-lift relative flex flex-col justify-between overflow-hidden group">
									{detectedOS === "windows" && (
										<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg shadow-sm">
											Current OS
										</div>
									)}
									<CardHeader className="pb-4">
										<div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
											<svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
												<path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.55v-8.1zM10.95 1.95L24 0v11.55H10.95V1.95zM10.95 12.45H24v11.55l-13.05-1.95v-9.6z" />
											</svg>
										</div>
										<CardTitle className="text-xl font-bold">Windows</CardTitle>
										<CardDescription>Desktop Client for Windows 10 & 11</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4 pb-6 flex-grow">
										<ul className="text-sm text-muted-foreground space-y-2">
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Full notifications & badge counts
											</li>
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Startup on system launch
											</li>
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Supports multiple workspaces
											</li>
										</ul>
									</CardContent>
									<CardFooter className="pt-0 border-t border-border/40 p-4 bg-muted/20 dark:bg-muted/10 flex flex-col gap-2">
										<Button asChild className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-2 text-xs h-10 shadow-sm" id="btn_win_msi">
											<a href="https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-win-x64.msi">
												<Download className="h-3.5 w-3.5" />
												Download MSI Installer (x64)
											</a>
										</Button>
										<Button asChild variant="outline" className="w-full border-border/80 hover:bg-accent/40 text-xs h-10" id="btn_win_zip">
											<a href="https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-win-x64.zip">
												Download Portable (ZIP)
											</a>
										</Button>
										<a
											href="https://apps.microsoft.com/store/detail/mattermost/XP8CG212M1N86X"
											target="_blank"
											rel="noopener noreferrer"
											className="text-[11px] text-muted-foreground hover:text-primary text-center mt-1 flex items-center justify-center gap-1 hover:underline"
										>
											Get from Microsoft Store <ExternalLink className="h-3 w-3" />
										</a>
									</CardFooter>
								</Card>

								{/* macOS Card */}
								<Card className="glass border-border/40 hover-lift relative flex flex-col justify-between overflow-hidden group">
									{detectedOS === "mac" && (
										<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg shadow-sm">
											Current OS
										</div>
									)}
									<CardHeader className="pb-4">
										<div className="h-12 w-12 rounded-xl bg-slate-900/10 dark:bg-slate-100/10 text-slate-800 dark:text-slate-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
											<AppleIcon className="h-6 w-6" />
										</div>
										<CardTitle className="text-xl font-bold">macOS</CardTitle>
										<CardDescription>Universal App for Intel & Apple Silicon</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4 pb-6 flex-grow">
										<ul className="text-sm text-muted-foreground space-y-2">
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Apple Silicon & Intel native support
											</li>
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Touch Bar & OS integrations
											</li>
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Sleek macOS layout
											</li>
										</ul>
									</CardContent>
									<CardFooter className="pt-0 border-t border-border/40 p-4 bg-muted/20 dark:bg-muted/10 flex flex-col gap-2">
										<Button asChild className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-2 text-xs h-10 shadow-sm" id="btn_mac_dmg">
											<a href="https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-mac-universal.dmg">
												<Download className="h-3.5 w-3.5" />
												Download DMG (Universal)
											</a>
										</Button>
										<Button asChild variant="outline" className="w-full border-border/80 hover:bg-accent/40 text-xs h-10" id="btn_mac_appstore">
											<a href="https://apps.apple.com/app/mattermost/id1616788410" target="_blank" rel="noopener noreferrer">
												<AppleIcon className="h-3.5 w-3.5 mr-1" />
												View in Mac App Store
											</a>
										</Button>
										<div className="text-[11px] text-muted-foreground text-center mt-1 block">
											Supports OS X 10.15 Catalina or later
										</div>
									</CardFooter>
								</Card>

								{/* Linux Card */}
								<Card className="glass border-border/40 hover-lift relative flex flex-col justify-between overflow-hidden group">
									{detectedOS === "linux" && (
										<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg shadow-sm">
											Current OS
										</div>
									)}
									<CardHeader className="pb-4">
										<div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
											<Terminal className="h-6 w-6" />
										</div>
										<CardTitle className="text-xl font-bold">Linux</CardTitle>
										<CardDescription>Available in DEB, RPM & TAR formats</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4 pb-6 flex-grow">
										<ul className="text-sm text-muted-foreground space-y-2">
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Desktop notifications (libnotify)
											</li>
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												System tray applet integrations
											</li>
											<li className="flex items-center gap-2">
												<div className="h-1.5 w-1.5 rounded-full bg-primary" />
												Debian & Red Hat package options
											</li>
										</ul>
									</CardContent>
									<CardFooter className="pt-0 border-t border-border/40 p-4 bg-muted/20 dark:bg-muted/10 flex flex-col gap-2">
										<Button asChild className="w-full bg-primary hover:bg-primary/95 text-primary-foreground gap-2 text-xs h-10 shadow-sm" id="btn_linux_tar">
											<a href="https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop-6.2.0-linux-x64.tar.gz">
												<Download className="h-3.5 w-3.5" />
												Download TAR.GZ (x64)
											</a>
										</Button>
										<Button asChild variant="outline" className="w-full border-border/80 hover:bg-accent/40 text-xs h-10" id="btn_linux_deb">
											<a href="https://releases.mattermost.com/desktop/6.2.0/mattermost-desktop_6.2.0-1_arm64.deb">
												Download DEB Package (ARM64)
											</a>
										</Button>
										<a
											href="https://github.com/mattermost/desktop/releases"
											target="_blank"
											rel="noopener noreferrer"
											className="text-[11px] text-muted-foreground hover:text-primary text-center mt-1 flex items-center justify-center gap-1 hover:underline"
										>
											View All Releases on GitHub <ExternalLink className="h-3 w-3" />
										</a>
									</CardFooter>
								</Card>

							</div>
						</TabsContent>

						{/* Mobile Clients Panel */}
						<TabsContent value="mobile" className="outline-none">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

								{/* iOS Card */}
								<Card className="glass border-border/40 hover-lift relative flex flex-col justify-between overflow-hidden group p-2">
									{detectedOS === "ios" && (
										<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg shadow-sm">
											Current OS
										</div>
									)}
									<div className="flex flex-col sm:flex-row items-center gap-6 p-6">
										{/* QR code container */}
										<div className="w-32 h-32 p-2 rounded-xl bg-white border border-border/80 flex flex-col items-center justify-center shadow-inner shrink-0 relative group overflow-hidden">
											<img
												src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("https://apps.apple.com/lk/app/mattermost/id1257222717")}`}
												alt="iOS App Store QR Code"
												className="w-full h-full object-contain"
											/>
											<div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl p-1 text-center">
												<span className="text-[10px] font-bold text-slate-800">Scan QR Code</span>
												<span className="text-[8px] text-slate-500 mt-0.5">Open/Scan with Camera</span>
											</div>
										</div>

										<div className="space-y-3 text-center sm:text-left">
											<div className="inline-flex p-2 rounded-lg bg-blue-500/10 text-blue-500">
												<AppleIcon className="h-5 w-5" />
											</div>
											<h3 className="text-lg font-bold">Mattermost for iOS</h3>
											<p className="text-xs text-muted-foreground">
												Compatible with iPhone, iPad and iPod touch. Sync messages instantly.
											</p>
											<Button asChild size="sm" className="bg-primary hover:bg-primary/95 gap-1 text-xs px-4 w-full sm:w-auto shadow-sm" id="btn_ios_store">
												<a href="https://apps.apple.com/lk/app/mattermost/id1257222717" target="_blank" rel="noopener noreferrer">
													Apple App Store
													<ExternalLink className="h-3 w-3 ml-1" />
												</a>
											</Button>
										</div>
									</div>
								</Card>

								{/* Android Card */}
								<Card className="glass border-border/40 hover-lift relative flex flex-col justify-between overflow-hidden group p-2">
									{detectedOS === "android" && (
										<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-bl-lg shadow-sm">
											Current OS
										</div>
									)}
									<div className="flex flex-col sm:flex-row items-center gap-6 p-6">
										{/* QR code container */}
										<div className="w-32 h-32 p-2 rounded-xl bg-white border border-border/80 flex flex-col items-center justify-center shadow-inner shrink-0 relative group overflow-hidden">
											<img
												src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("https://play.google.com/store/apps/details?id=com.mattermost.rn")}`}
												alt="Android Play Store QR Code"
												className="w-full h-full object-contain"
											/>
											<div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl p-1 text-center">
												<span className="text-[10px] font-bold text-slate-800">Scan QR Code</span>
												<span className="text-[8px] text-slate-500 mt-0.5">Open/Scan with Camera</span>
											</div>
										</div>

										<div className="space-y-3 text-center sm:text-left">
											<div className="inline-flex p-2 rounded-lg bg-green-500/10 text-green-500">
												<AndroidIcon className="h-5 w-5" />
											</div>
											<h3 className="text-lg font-bold">Mattermost for Android</h3>
											<p className="text-xs text-muted-foreground">
												Optimized for Android phones and tablets. Secure push notifications.
											</p>
											<Button asChild size="sm" className="bg-primary hover:bg-primary/95 gap-1 text-xs px-4 w-full sm:w-auto shadow-sm" id="btn_android_store">
												<a href="https://play.google.com/store/apps/details?id=com.mattermost.rn" target="_blank" rel="noopener noreferrer">
													Google Play Store
													<ExternalLink className="h-3 w-3 ml-1" />
												</a>
											</Button>
										</div>
									</div>
								</Card>

							</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Step-by-Step Installation Walkthrough */}
				<div className="w-full max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
					<div className="space-y-2">
						<h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">Quick Installation Walkthrough</h2>
						<p className="text-sm text-muted-foreground max-w-lg mx-auto">
							Get your workspace set up and active in less than 3 minutes.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-6">
						{/* Step 1 */}
						<div className="p-6 rounded-xl glass border border-border/40 hover:border-primary/20 transition-all flex flex-col justify-between">
							<div>
								<div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-4">
									1
								</div>
								<h3 className="font-bold text-slate-900 dark:text-white mb-2">Download Client</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Choose and download the Mattermost application corresponding to your operating system or mobile device above.
								</p>
							</div>
							<div className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-4">
								Step 1 of 3 <ArrowRight className="h-3 w-3" />
							</div>
						</div>

						{/* Step 2 */}
						<div className="p-6 rounded-xl glass border border-border/40 hover:border-primary/20 transition-all flex flex-col justify-between">
							<div>
								<div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-4">
									2
								</div>
								<h3 className="font-bold text-slate-900 dark:text-white mb-2">Configure Server</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Launch the app, enter **Aura** as the Display Name, and copy-paste the Server URL: `{serverUrl}` when prompted.
								</p>
							</div>
							<div className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-4">
								Step 2 of 3 <ArrowRight className="h-3 w-3" />
							</div>
						</div>

						{/* Step 3 */}
						<div className="p-6 rounded-xl glass border border-border/40 hover:border-primary/20 transition-all flex flex-col justify-between">
							<div>
								<div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-4">
									3
								</div>
								<h3 className="font-bold text-slate-900 dark:text-white mb-2">Log In to Aura</h3>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Sign in using the same credentials (email and password) that you use to access the Aura Task Manager dashboard.
								</p>
							</div>
							<div className="text-[10px] text-green-600 dark:text-green-500 font-semibold flex items-center gap-1 mt-4">
								Ready to use <Check className="h-3 w-3" />
							</div>
						</div>
					</div>
				</div>

			</main>

			{/* Simple Footer */}
			<footer className="relative z-10 w-full border-t border-border/40 bg-background/30 backdrop-blur-sm mt-auto py-6">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
					<p>© {new Date().getFullYear()} ArtsLab Creatives. All rights reserved.</p>
					<div className="flex gap-4">
						<Link to="/" className="hover:text-primary transition-colors">Aura Dashboard</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
