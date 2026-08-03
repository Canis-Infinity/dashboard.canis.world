// @ts-nocheck
import * as React from "react"

import { cn } from "@/lib/utils"

const Field = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field"
    className={cn("grid gap-2", className)}
    {...props}
  />
))
Field.displayName = "Field"

const FieldGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn("grid gap-4", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    data-slot="field-label"
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn("grid gap-1.5", className)}
    {...props}
  />
))
FieldContent.displayName = "FieldContent"

export { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel }
