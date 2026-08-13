"use client";

import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

export default function SubscriptionSettingsPage() {
  const isPro = false; // We can mock this for now

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold mb-2">Subscription & Billing</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Manage your subscription plan and billing history.
        </p>

        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm max-w-3xl">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-border/50">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-xs font-semibold uppercase tracking-widest mb-4">
                Current Plan
              </div>
              <h3 className="text-3xl font-bold flex items-center gap-2">
                {isPro ? "Pro Plan" : "Free Tier"}
                {isPro && <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
              </h3>
              <p className="text-muted-foreground mt-2">
                {isPro 
                  ? "You have full access to all premium features and labs."
                  : "Upgrade to unlock all practice labs and real-world projects."}
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto">
                {isPro ? "Manage Billing" : "Upgrade to Pro"}
              </Button>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-secondary/5">
            <h4 className="font-semibold mb-4">Plan Benefits</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm">Access to Core Curriculum</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm text-muted-foreground">Basic Interactive Labs</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center"></div>
                <span className="text-sm text-muted-foreground">All 180+ Practice Challenges</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center"></div>
                <span className="text-sm text-muted-foreground">Real-world Project Walkthroughs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
