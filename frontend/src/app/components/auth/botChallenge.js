"use client";

import { useEffect, useRef } from "react";

export default function BotChallenge({ onToken }) {
  const container = useRef(null);
  const widgetId = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (!container.current || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": () => onToken(""),
      });
    };
    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector('script[data-phone-sine-turnstile="true"]');
      const script = existing || document.createElement("script");
      if (!existing) {
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.dataset.phoneSineTurnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      return () => script.removeEventListener("load", render);
    }
  }, [onToken, siteKey]);

  if (!siteKey) return null;
  return <div ref={container} className="my-2" />;
}
