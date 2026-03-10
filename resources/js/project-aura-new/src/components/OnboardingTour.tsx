import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';

export interface TourStep {
    target: string; // CSS selector
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    spotlightPadding?: number;
    action?: () => void; // Optional action to execute when step is shown
}

interface OnboardingTourProps {
    steps: TourStep[];
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
    tourId: string; // Unique ID for localStorage
}

export function OnboardingTour({ steps, isOpen, onComplete, onSkip, tourId }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const step = steps[currentStep];

    const calculatePosition = useCallback(() => {
        if (!step) return;

        const target = document.querySelector(step.target);
        if (!target) {
            // If target not found, show centered
            setTargetRect(null);
            setTooltipPosition({
                top: window.innerHeight / 2 - 100,
                left: window.innerWidth / 2 - 200
            });
            return;
        }

        const rect = target.getBoundingClientRect();
        setTargetRect(rect);

        const padding = step.spotlightPadding || 8;
        const tooltipWidth = 400;
        const tooltipHeight = 200;

        let top = 0;
        let left = 0;

        switch (step.placement || 'bottom') {
            case 'top':
                top = rect.top - tooltipHeight - padding - 20;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + padding + 20;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - padding - 20;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + padding + 20;
                break;
            case 'center':
                top = window.innerHeight / 2 - tooltipHeight / 2;
                left = window.innerWidth / 2 - tooltipWidth / 2;
                break;
        }

        // Keep tooltip in viewport
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
        top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));

        setTooltipPosition({ top, left });
    }, [step]);

    useEffect(() => {
        if (isOpen && step) {
            calculatePosition();
            step.action?.();

            // Scroll target into view
            const target = document.querySelector(step.target);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Recalculate after scroll
                setTimeout(calculatePosition, 500);
            }
        }
    }, [isOpen, currentStep, step, calculatePosition]);

    useEffect(() => {
        const handleResize = () => calculatePosition();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculatePosition]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem(`onboarding_${tourId}_completed`, 'true');
        setCurrentStep(0);
        onComplete();
    };

    const handleSkip = () => {
        localStorage.setItem(`onboarding_${tourId}_completed`, 'true');
        setCurrentStep(0);
        onSkip();
    };

    if (!isOpen) return null;

    const spotlightPadding = step?.spotlightPadding || 8;

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop with spotlight hole */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'normal' }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - spotlightPadding}
                                y={targetRect.top - spotlightPadding}
                                width={targetRect.width + spotlightPadding * 2}
                                height={targetRect.height + spotlightPadding * 2}
                                rx="8"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#spotlight-mask)"
                    className="pointer-events-auto"
                    onClick={handleSkip}
                />
            </svg>

            {/* Spotlight border glow */}
            {targetRect && (
                <div
                    className="absolute border-2 border-primary rounded-lg pointer-events-none animate-pulse"
                    style={{
                        left: targetRect.left - spotlightPadding,
                        top: targetRect.top - spotlightPadding,
                        width: targetRect.width + spotlightPadding * 2,
                        height: targetRect.height + spotlightPadding * 2,
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)'
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                className="absolute bg-card border shadow-2xl rounded-xl p-6 w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    zIndex: 10000
                }}
            >
                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step?.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {step?.content}
                </p>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="text-muted-foreground"
                    >
                        Skip tour
                    </Button>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleNext}
                            className="min-w-[100px]"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Finish
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Hook to manage tour state
export function useOnboardingTour(tourId: string) {
    const [isOpen, setIsOpen] = useState(false);

    const hasCompleted = useCallback(() => {
        return localStorage.getItem(`onboarding_${tourId}_completed`) === 'true';
    }, [tourId]);

    const startTour = useCallback(() => {
        setIsOpen(true);
    }, []);

    const endTour = useCallback(() => {
        setIsOpen(false);
    }, []);

    const resetTour = useCallback(() => {
        localStorage.removeItem(`onboarding_${tourId}_completed`);
    }, [tourId]);

    // Auto-start if not completed
    const autoStart = useCallback(() => {
        if (!hasCompleted()) {
            // Small delay to let page render
            setTimeout(() => setIsOpen(true), 1000);
        }
    }, [hasCompleted]);

    return {
        isOpen,
        startTour,
        endTour,
        resetTour,
        hasCompleted,
        autoStart
    };
}
