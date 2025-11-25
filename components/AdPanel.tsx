"use client";

import { Card } from "@/components/ui/card";

export function AdPanel() {
  return (
    <div className="sticky top-4">
      <Card className="w-[300px] h-[250px] flex items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground">
          <p className="text-sm font-medium mb-2">Advertisement</p>
          <p className="text-xs">300x250 Ad Space</p>
          <p className="text-xs mt-2">AdSense placeholder</p>
        </div>
      </Card>
    </div>
  );
}
