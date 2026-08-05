"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"
import {
  DynamicIcon,
  iconNames,
  type IconName,
} from "lucide-react/dynamic"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const MAX_RESULTS = 50
const COMMON_ICON_NAMES = [
  "globe",
  "link",
  "external-link",
  "instagram",
  "facebook",
  "youtube",
  "twitch",
  "github",
  "linkedin",
  "mail",
  "message-circle",
  "phone",
  "map-pin",
  "store",
  "shopping-bag",
  "music-2",
  "gamepad-2",
] as const

const iconNameSet = new Set<string>(iconNames)
const commonIconNames = COMMON_ICON_NAMES.filter((name) =>
  iconNameSet.has(name)
) as IconName[]

export function normalizeLucideIconName(value: string | null | undefined) {
  if (!value) return ""

  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
}

function IconPreview({ name }: { name: string }) {
  if (!iconNameSet.has(name)) {
    return <CircleHelp aria-hidden="true" className="size-4" />
  }

  return (
    <DynamicIcon
      aria-hidden="true"
      className="size-4"
      name={name as IconName}
    />
  )
}

interface IconComboboxProps {
  id?: string
  value?: string | null
  onValueChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
}

export function IconCombobox({
  id,
  value,
  onValueChange,
  disabled = false,
  required = false,
  placeholder = "搜尋 Lucide 圖示",
}: IconComboboxProps) {
  const normalizedValue = normalizeLucideIconName(value)
  const [inputValue, setInputValue] = React.useState(normalizedValue)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setInputValue(normalizedValue)
  }, [normalizedValue])

  const results = React.useMemo(() => {
    const query = normalizeLucideIconName(inputValue)
    if (!query) return commonIconNames

    const queryParts = query.split("-").filter(Boolean)
    return iconNames
      .filter((name) => queryParts.every((part) => name.includes(part)))
      .slice(0, MAX_RESULTS)
  }, [inputValue])

  return (
    <Combobox
      items={results}
      open={open}
      value={iconNameSet.has(normalizedValue) ? normalizedValue : null}
      inputValue={inputValue}
      onInputValueChange={(nextInputValue) => {
        setInputValue(nextInputValue)
        setOpen(true)
      }}
      onValueChange={(nextValue) => {
        if (!nextValue) return
        setInputValue(nextValue)
        onValueChange(nextValue)
      }}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setInputValue(normalizedValue)
      }}
      autoHighlight
    >
      <ComboboxInput
        id={id}
        aria-label="Lucide 圖示"
        className="[&_input]:pl-9"
        disabled={disabled}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
      >
        <span className="pointer-events-none absolute left-3 flex text-muted-foreground">
          {normalizedValue ? (
            <IconPreview name={normalizedValue} />
          ) : (
            <CircleHelp aria-hidden="true" className="size-4" />
          )}
        </span>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty className="p-0">
          <Empty className="border-0 p-6">
            <EmptyHeader className="">
              <EmptyMedia className="" variant="icon">
                <CircleHelp />
              </EmptyMedia>
              <EmptyTitle className="">找不到圖示</EmptyTitle>
              <EmptyDescription className="">
                請嘗試其他 Lucide 英文名稱。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ComboboxEmpty>
        <ComboboxList>
          {(name: IconName) => (
            <ComboboxItem key={name} value={name}>
              <IconPreview name={name} />
              <span className="truncate">{name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
