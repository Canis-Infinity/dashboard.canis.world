"use client"

import type * as React from "react"
import { format, isValid, parseISO } from "date-fns"
import { zhTW } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DayPicker } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const TypedCalendar = Calendar as React.ComponentType<
  React.ComponentProps<typeof DayPicker>
>

type DatePickerProps = {
  id: string
  label: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "選擇日期",
  required,
  className,
}: DatePickerProps) {
  const parsedDate = value ? parseISO(value) : undefined
  const date = parsedDate && isValid(parsedDate) ? parsedDate : undefined

  return (
    <div data-slot="field" className={cn("grid w-full gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start px-2.5 text-left font-normal",
                !date && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? format(date, "PPP", { locale: zhTW }) : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <TypedCalendar
            mode="single"
            locale={zhTW}
            selected={date}
            defaultMonth={date}
            required={required}
            onSelect={(nextDate) =>
              onChange?.(nextDate ? format(nextDate, "yyyy-MM-dd") : "")
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
