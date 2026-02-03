import logo from "@/assets/Logo.png";

export function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-background/95 backdrop-blur-sm text-foreground animate-in fade-in duration-300 z-50">
            <div className="relative flex items-center justify-center">
                {/* Outer glowing ring */}
                <div className="absolute h-32 w-32 rounded-full border-4 border-primary/10" />

                {/* Spinning ring */}
                <div className="absolute h-32 w-32 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />

                {/* Inner pulsing ring */}
                <div className="absolute h-24 w-24 rounded-full bg-primary/5 animate-pulse" />

                {/* Logo in the middle */}
                <div className="relative h-16 w-16 flex items-center justify-center bg-background rounded-full shadow-sm z-10">
                    <img
                        src={logo}
                        alt="Loading..."
                        className="h-10 w-10 object-contain"
                    />
                </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-lg font-medium tracking-tight text-foreground">Loading Aura</p>
                <div className="flex gap-1 h-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
