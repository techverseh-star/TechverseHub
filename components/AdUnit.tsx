import React, { useEffect } from "react";

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
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className={`w-fit min-h-0 bg-background ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: "block", backgroundColor: "transparent", ...style }}
                data-ad-client="ca-pub-3928367405059176"
                data-ad-slot={slotId}
                data-ad-format={format}
            ></ins>
        </div>
    );
}
