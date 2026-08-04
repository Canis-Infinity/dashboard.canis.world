// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const scrollable = scrollHeight > window.innerHeight + 120;
      setVisible(scrollable && scrollTop > 240);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    document.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      document.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="回到最上方"
          className={cn(
            "fixed bottom-5 right-5 z-40 rounded-full shadow-lg transition-all md:bottom-6 md:right-6",
            visible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0",
          )}
          onClick={() => {
            if (window.location.hash) {
              window.history.replaceState(
                null,
                "",
                `${window.location.pathname}${window.location.search}`,
              );
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.documentElement.scrollTo?.({ top: 0, behavior: "smooth" });
          }}
        >
          <ArrowUp className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>回到最上方</TooltipContent>
    </Tooltip>
  );
}
