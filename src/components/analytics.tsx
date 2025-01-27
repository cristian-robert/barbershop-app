"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const init = async () => {
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          loaded: (posthog: typeof import("posthog-js")) => {
            if (process.env.NODE_ENV === "development") posthog.debug();
          },
          capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        });
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (posthog.initialized) {
      posthog.capture("$pageview", {
        current_url: window.location.href,
        pathname,
        search: searchParams.toString(),
      });
    }
  }, [pathname, searchParams]);

  return null;
}
