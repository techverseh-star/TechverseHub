"use client";

import React, { useState } from "react";
import { Lock, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallProps {
  lessonTitle: string;
  price: number;
  description?: string;
  userId: string;
  itemId: string;
}

export function Paywall({ lessonTitle, price, description, userId, itemId }: PaywallProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // Create order on our backend
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, itemId, userId }),
      });
      
      const order = await orderRes.json();
      
      if (order.error) {
        throw new Error(order.error);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key", 
        amount: order.amount,
        currency: order.currency,
        name: "TechVerse Hub",
        description: `Unlock ${lessonTitle}`,
        order_id: order.id,
        handler: async function (response: any) {
          // If mock order, Razorpay SDK won't really pop up successfully without keys,
          // but if we handle dummy_key logic manually or Razorpay test mode works:
          
          // Verify signature on backend
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              itemId,
              amount: price,
              isMock: order.mock
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setSuccess(true);
            setTimeout(() => window.location.reload(), 1500);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "Student",
          email: "student@techverse.com",
        },
        theme: {
          color: "#3b82f6", // Primary blue
        },
      };

      // If it's a mock order (dev mode with no keys), simulate successful payment immediately
      if (order.mock) {
        console.log("Mock mode: Simulating successful payment");
        options.handler({
          razorpay_order_id: order.id,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: "mock_sig"
        });
        return;
      }

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        console.error("Payment Failed", response.error);
      });
      rzp1.open();

    } catch (error) {
      console.error("Purchase failed", error);
      alert("Failed to initiate checkout");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
        <p className="text-muted-foreground">Unlocking premium content...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 md:p-16 text-center bg-background/60 backdrop-blur-md">
      <div className="max-w-md w-full bg-card/80 border shadow-2xl rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-primary/20 rounded-full blur-[50px] -z-10 opacity-70" />

        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Premium Content Locked</h2>
        
        <p className="text-muted-foreground mb-8 text-sm">
          {description || (
            <>
              The lesson <span className="text-foreground font-semibold">"{lessonTitle}"</span> is premium content. Unlock this lesson to access its full contents and interactive features.
            </>
          )}
        </p>

        <Button 
          className="w-full h-12 text-md font-medium shadow-md transition-all duration-300"
          onClick={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="w-5 h-5 mr-2" />
          )}
          {loading ? "Processing..." : `Unlock for ₹${price}`}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-4 text-center tracking-wide uppercase font-semibold opacity-70">
          Secure payment • Lifetime access
        </p>
      </div>
    </div>
  );
}
