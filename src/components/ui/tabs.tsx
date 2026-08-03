// @ts-nocheck
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-9 rounded-lg bg-muted p-1",
        line:
          "group/tabs-list h-9 gap-4 border-b bg-transparent p-0 [&_[data-slot=tabs-trigger]]:-mb-px [&_[data-slot=tabs-trigger]]:h-9 [&_[data-slot=tabs-trigger]]:rounded-none [&_[data-slot=tabs-trigger]]:border-b-2 [&_[data-slot=tabs-trigger]]:border-transparent [&_[data-slot=tabs-trigger]]:bg-transparent [&_[data-slot=tabs-trigger]]:px-0 [&_[data-slot=tabs-trigger]]:shadow-none [&_[data-slot=tabs-trigger][data-state=active]]:border-foreground [&_[data-slot=tabs-trigger][data-state=active]]:bg-transparent [&_[data-slot=tabs-trigger][data-state=active]]:text-foreground [&_[data-slot=tabs-trigger][data-state=active]]:shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-md px-3 py-1 ring-offset-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        line:
          "-mb-px h-9 rounded-none border-b-2 border-transparent px-0 text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TabsList = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    data-variant={variant}
    className={cn(tabsListVariants({ variant }), className)}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      tabsTriggerVariants({ variant }),
      className
    )}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
