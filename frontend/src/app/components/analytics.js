import Script from "next/script";
import { analyticsConfig } from "./analytics.mjs";

export default function Analytics() {
  const config = analyticsConfig();
  if (!config) return null;
  return (
    <Script
      src={config.src}
      data-domain={config.domain}
      data-api="/analytics/event"
      data-exclude="/checkout,/admin,/orders,/payment-methods,/profile,/security"
      strategy="afterInteractive"
    />
  );
}

export { analyticsConfig };
