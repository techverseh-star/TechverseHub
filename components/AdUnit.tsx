import React, { useEffect, useState, useRef } from "react";

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdUnitProps {
    slotId: string;
    className?: string;
    format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal" | null;
    style?: React.CSSProperties;
}

export function AdUnit({ slotId, className = "", format = "vertical", style = {} }: AdUnitProps) {
    const [isVisible, setIsVisible] = useState(false);
    const insRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        // Smart visibility: Only show when ad is actually filled
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "data-ad-status") {
                    const status = insRef.current?.getAttribute("data-ad-status");
                    if (status === "filled") {
                        setIsVisible(true);
                    }
                }
            });
        });

        if (insRef.current) {
            // Check initial status in case it loaded instantly
            if (insRef.current.getAttribute("data-ad-status") === "filled") {
                setIsVisible(true);
            }

            observer.observe(insRef.current, {
                attributes: true,
                attributeFilter: ["data-ad-status"], // Watch for AdSense status changes
            });
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            className={`w-fit min-h-0 transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"} ${className}`}
            style={{ visibility: isVisible ? "visible" : "hidden" }}
        >
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: "block", backgroundColor: "transparent", ...style }}
                data-ad-client="ca-pub-3928367405059176"
                data-ad-slot={slotId}
                data-ad-format={format}
            ></ins>
        </div>
    );
}
