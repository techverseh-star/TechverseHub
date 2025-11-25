"use client";

import { Card } from "@/components/ui/card";

export function AdPanel() {
  return (
    <div className="sticky top-24">
      <Card className="w-full h-[250px] flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-secondary/50 border-dashed">
        <div className="text-center text-muted-foreground p-4">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1">Ad Space</p>
          <p className="text-xs opacity-70">300 x 250</p>
          <p className="text-xs opacity-50 mt-2">AdSense Placeholder</p>
        </div>
      </Card>
    </div>
  );
}
