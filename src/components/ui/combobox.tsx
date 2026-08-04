// @ts-nocheck
"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Combobox({ className, ...props }) {
  return (
    <ComboboxPrimitive.Root
      data-slot="combobox"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function ComboboxInput({ className, ...props }) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ComboboxContent({
  className,
  sideOffset = 4,
  align = "start",
  ...props
}) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "max-h-72 min-w-[var(--anchor-width)] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxEmpty({ className, ...props }) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("px-2 py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxList({ className, ...props }) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-60 overflow-x-hidden overflow-y-auto overscroll-contain",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "group/combobox-item relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted data-[highlighted]:bg-muted data-[selected]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <CheckIcon className="size-4 opacity-0 group-data-[selected]/combobox-item:opacity-100" />
    </ComboboxPrimitive.Item>
  )
}

export {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
}
