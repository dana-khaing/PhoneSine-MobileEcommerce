function validAnalyticsSource(src) {
  if (!src) return false;
  try {
    const parsed = new URL(src);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function analyticsConfig(env = process.env) {
  const domain = env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  const src = env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL;
  if (!domain || !validAnalyticsSource(src)) return null;
  return { domain, src };
}
