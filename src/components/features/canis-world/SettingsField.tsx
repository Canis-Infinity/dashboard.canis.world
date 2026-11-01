// @ts-nocheck
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function SettingsField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) {
  const resolvedPlaceholder =
    placeholder ??
    (type === "date"
      ? undefined
      : `請輸入${String(label).replace("，逗號分隔", "")}`);

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value || ""}
        placeholder={resolvedPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}
