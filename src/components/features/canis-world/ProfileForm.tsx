// @ts-nocheck
"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Field from "./SettingsField";

export default function SettingsForm({ value, onChange }) {
  const settings = { profile: value };
  const updateProfile = onChange;
  const traitsText = value.traitsText ?? (value.traits || []).join(", ");
  return (
    <Card>
      <CardHeader className="gap-1.5 space-y-0">
        <CardTitle>角色介紹</CardTitle>
        <CardDescription>
          Canis World 的公開簡介，不取代 iistw.com 的正式身分。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field
          id="display-name"
          label="顯示名稱"
          value={settings.profile?.displayName}
          onChange={(value) => updateProfile("displayName", value)}
        />
        <Field
          id="subtitle"
          label="副標題"
          value={settings.profile?.subtitle}
          onChange={(value) => updateProfile("subtitle", value)}
        />
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="intro">介紹</Label>
          <Textarea
            id="intro"
            placeholder="請輸入角色介紹"
            value={settings.profile?.intro || ""}
            onChange={(event) => updateProfile("intro", event.target.value)}
            className="min-h-24"
          />
        </div>
        <Field
          id="traits"
          label="特徵標籤，逗號分隔"
          placeholder="例如：人型犬, 日常紀錄, 基地生活"
          value={traitsText}
          onChange={(value) => updateProfile("traitsText", value)}
        />
      </CardContent>
    </Card>
  );
}
