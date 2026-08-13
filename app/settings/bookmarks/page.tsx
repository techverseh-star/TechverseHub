"use client";

import { Bookmark, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookmarksSettingsPage() {
  // In a real app, this would be fetched from Supabase
  const savedItems = [
    { type: "Module", title: "Advanced Memory Management in C", date: "2 days ago", link: "/learn" },
    { type: "Practice", title: "Reverse a Linked List", date: "1 week ago", link: "/practice" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bookmarks & Activity</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Pick up where you left off and review your saved lessons.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Saved Items */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <Bookmark className="h-4 w-4" />
              Saved Items
            </h3>
            
            <div className="space-y-3">
              {savedItems.map((item, i) => (
                <Link key={i} href={item.link}>
                  <div className="p-4 border border-border/50 rounded-xl bg-secondary/5 hover:bg-secondary/20 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-muted-foreground uppercase">{item.type}</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <div className="font-medium group-hover:text-primary transition-colors flex justify-between items-center">
                      {item.title}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-zinc-500">
              <Clock className="h-4 w-4" />
              Recent Activity
            </h3>
            
            <div className="p-8 border border-border/50 rounded-xl bg-background/50 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No recent activity to show yet.
              </p>
              <Link href="/learn">
                <Button variant="outline" size="sm">Start Learning</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
