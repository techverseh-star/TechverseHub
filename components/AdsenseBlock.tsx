"use client";
import { useEffect } from "react";

interface AdsenseBlockProps {
  slot: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdsenseBlock({ slot }: AdsenseBlockProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) { }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "300px", height: "250px" }}
      data-ad-client="ca-pub-3928367405059176"
      data-ad-slot={slot}
      data-ad-format="rectangle"
    ></ins>
  );
}
