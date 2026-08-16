"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"
import {
  DynamicIcon,
  iconNames,
  type IconName,
} from "lucide-react/dynamic"
import { FaLinkedin } from "react-icons/fa"
import * as SimpleIcons from "react-icons/si"
import type { IconType } from "react-icons"

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
const BRAND_ICON_NAMES = [
  "SiDiscord",
  "SiFacebook",
  "SiGithub",
  "SiInstagram",
  "SiLine",
  "SiLinkedin",
  "SiMastodon",
  "SiMedium",
  "SiPatreon",
  "SiPaypal",
  "SiPixiv",
  "SiQq",
  "SiRetroarch",
  "SiTelegram",
  "SiThreads",
  "SiTiktok",
  "SiWechat",
  "SiWeibo",
  "SiWhatsapp",
  "SiX",
  "SiYoutube",
] as const

const iconNameSet = new Set<string>(iconNames)
const commonIconNames = COMMON_ICON_NAMES.filter((name) =>
  iconNameSet.has(name)
) as IconName[]
const brandIconRegistry = SimpleIcons as Record<string, unknown>
const brandIconAliases: Record<string, IconType> = {
  SiLinkedin: FaLinkedin,
  SiWeibo: SimpleIcons.SiSinaweibo,
}
const brandIconNameSet = new Set<string>(BRAND_ICON_NAMES)

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

function normalizeIconValue(
  value: string | null | undefined,
  includeBrandIcons: boolean
) {
  const trimmedValue = value?.trim() || ""
  if (!trimmedValue) return ""
  if (includeBrandIcons && brandIconNameSet.has(trimmedValue)) {
    return trimmedValue
  }

  return normalizeLucideIconName(trimmedValue)
}

function getBrandIcon(name: string) {
  const icon = brandIconAliases[name] ?? brandIconRegistry[name]
  return typeof icon === "function" ? (icon as IconType) : undefined
}

function IconPreview({
  name,
  includeBrandIcons = false,
}: {
  name: string
  includeBrandIcons?: boolean
}) {
  const BrandIcon = includeBrandIcons ? getBrandIcon(name) : undefined
  if (BrandIcon) {
    return <BrandIcon aria-hidden="true" className="size-4" />
  }

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
  includeBrandIcons?: boolean
}

export function IconCombobox({
  id,
  value,
  onValueChange,
  disabled = false,
  required = false,
  placeholder = "搜尋 Lucide 圖示",
  includeBrandIcons = false,
}: IconComboboxProps) {
  const normalizedValue = normalizeIconValue(value, includeBrandIcons)
  const [inputValue, setInputValue] = React.useState(normalizedValue)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setInputValue(normalizedValue)
  }, [normalizedValue])

  const results = React.useMemo(() => {
    const normalizedQuery = normalizeLucideIconName(inputValue)
    const rawQuery = inputValue.trim().toLowerCase()
    const baseOptions = includeBrandIcons
      ? [...BRAND_ICON_NAMES, ...commonIconNames]
      : commonIconNames
    if (!normalizedQuery && !rawQuery) return baseOptions

    const queryParts = normalizedQuery.split("-").filter(Boolean)
    const brandResults = includeBrandIcons
      ? BRAND_ICON_NAMES.filter((name) =>
          name.toLowerCase().includes(rawQuery.replace(/[\s_-]+/g, ""))
        )
      : []
    const lucideResults = iconNames
      .filter((name) => queryParts.every((part) => name.includes(part)))
      .slice(0, MAX_RESULTS)

    return [...brandResults, ...lucideResults].slice(0, MAX_RESULTS)
  }, [includeBrandIcons, inputValue])

  const selectedValue =
    iconNameSet.has(normalizedValue) ||
    (includeBrandIcons && brandIconNameSet.has(normalizedValue))
      ? normalizedValue
      : null

  return (
    <Combobox
      items={results}
      open={open}
      value={selectedValue}
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
            <IconPreview
              name={normalizedValue}
              includeBrandIcons={includeBrandIcons}
            />
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
          {(name: string) => (
            <ComboboxItem key={name} value={name}>
              <IconPreview name={name} includeBrandIcons={includeBrandIcons} />
              <span className="truncate">{name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
