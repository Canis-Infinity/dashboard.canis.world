// @ts-nocheck
"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

function useDisableTooltip() {
  const [disabled, setDisabled] = React.useState(true)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)")
    const updateDisabled = () => setDisabled(mediaQuery.matches)

    updateDisabled()
    mediaQuery.addEventListener("change", updateDisabled)

    return () => mediaQuery.removeEventListener("change", updateDisabled)
  }, [])

  return disabled
}

const Tooltip = ({ disabled, ...props }) => {
  const disableForTouch = useDisableTooltip()

  return <TooltipPrimitive.Root disabled={disabled || disableForTouch} {...props} />
}

const TooltipTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => (
  <TooltipPrimitive.Trigger ref={ref} render={asChild ? children : undefined} {...props}>
    {asChild ? undefined : children}
  </TooltipPrimitive.Trigger>
))
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className, side = "top", sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset} className="z-[80]">
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "overflow-hidden rounded-md bg-foreground px-3 py-1.5 text-xs text-background duration-0 data-[instant]:duration-0 data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom",
          className
        )}
        {...props} />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
