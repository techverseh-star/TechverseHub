"use client";

import { Card } from "@/components/ui/card";

interface AdConfig {
  id: string;
  imageUrl?: string;
  linkUrl?: string;
  title?: string;
  description?: string;
}

interface AdPanelProps {
  variant?: "sidebar" | "banner" | "inline";
  className?: string;
  ads?: AdConfig[];
}

export function AdPanel({ variant = "sidebar", className = "", ads = [] }: AdPanelProps) {
  if (!ads || ads.length === 0) {
    return null;
  }

  const ad = ads[0];

  if (variant === "banner") {
    return (
      <div className={`w-full ${className}`}>
        <Card className="overflow-hidden bg-gradient-to-r from-secondary/50 to-secondary/30 border-dashed border-muted-foreground/20">
          <a 
            href={ad.linkUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center p-3 hover:bg-secondary/50 transition-colors"
          >
            {ad.imageUrl ? (
              <img src={ad.imageUrl} alt={ad.title || "Advertisement"} className="max-h-16 object-contain" />
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{ad.title || "Sponsored"}</p>
                {ad.description && <p className="text-xs text-muted-foreground/70">{ad.description}</p>}
              </div>
            )}
          </a>
        </Card>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`${className}`}>
        <Card className="overflow-hidden bg-secondary/30 border-dashed border-muted-foreground/20">
          <a 
            href={ad.linkUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-4 hover:bg-secondary/50 transition-colors"
          >
            {ad.imageUrl ? (
              <img src={ad.imageUrl} alt={ad.title || "Advertisement"} className="w-full h-auto object-contain rounded" />
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">{ad.title || "Sponsored"}</p>
                {ad.description && <p className="text-xs text-muted-foreground/70 mt-1">{ad.description}</p>}
              </div>
            )}
          </a>
          <div className="px-4 pb-2">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Ad</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`sticky top-24 ${className}`}>
      <Card className="w-full overflow-hidden bg-gradient-to-br from-secondary to-secondary/50 border-dashed border-muted-foreground/20">
        <a 
          href={ad.linkUrl || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:bg-secondary/50 transition-colors"
        >
          {ad.imageUrl ? (
            <img src={ad.imageUrl} alt={ad.title || "Advertisement"} className="w-full h-auto object-cover" />
          ) : (
            <div className="text-center text-muted-foreground p-4 h-[250px] flex flex-col items-center justify-center">
              <p className="text-sm font-medium mb-1">{ad.title || "Sponsored"}</p>
              {ad.description && <p className="text-xs opacity-70">{ad.description}</p>}
            </div>
          )}
        </a>
        <div className="px-3 py-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Advertisement</span>
        </div>
      </Card>
    </div>
  );
}

export function AdSlot({ position, className = "" }: { position: string; className?: string }) {
  return null;
}
