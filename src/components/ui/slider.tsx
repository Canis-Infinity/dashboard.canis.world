"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({ className, ...props }: SliderPrimitive.Root.Props) {
  const values = Array.isArray(props.value)
    ? props.value
    : Array.isArray(props.defaultValue)
      ? props.defaultValue
      : [props.value ?? props.defaultValue ?? props.min ?? 0];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "w-full touch-none select-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-5 w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Indicator className="rounded-full bg-primary" />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            index={index}
            className="size-4 rounded-full border border-primary bg-background shadow-sm outline-none ring-ring/50 transition-shadow hover:ring-4 focus-visible:ring-4"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
