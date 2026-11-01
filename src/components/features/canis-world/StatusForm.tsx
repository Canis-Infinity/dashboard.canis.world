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
import { Slider } from "@/components/ui/slider";
import Field from "./SettingsField";

export default function SettingsForm({ value, onChange }) {
  const settings = { status: value };
  const updateStatus = onChange;
  return (
    <Card>
      <CardHeader className="gap-1.5 space-y-0">
        <CardTitle>今日狀態</CardTitle>
        <CardDescription>首頁第一眼會看到的 Canis 狀態面板。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field
          id="status-label"
          label="狀態"
          value={settings.status?.label}
          onChange={(value) => updateStatus("label", value)}
        />
        <Field
          id="status-mood"
          label="心情"
          value={settings.status?.mood}
          onChange={(value) => updateStatus("mood", value)}
        />
        <Field
          id="status-doing"
          label="正在做"
          value={settings.status?.doing}
          onChange={(value) => updateStatus("doing", value)}
        />
        <Field
          id="status-location"
          label="出沒地點"
          value={settings.status?.location}
          onChange={(value) => updateStatus("location", value)}
        />
        <div className="grid gap-2">
          <Label htmlFor="status-note">一句話</Label>
          <Textarea
            id="status-note"
            placeholder="請輸入今日狀態補充"
            value={settings.status?.note || ""}
            onChange={(event) => updateStatus("note", event.target.value)}
            className="min-h-20"
          />
        </div>
        <div className="grid content-start gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="status-completeness">今日狀態完整度</Label>
            <span className="text-sm tabular-nums text-muted-foreground">
              {Number(settings.status?.completeness) || 0}%
            </span>
          </div>
          <Slider
            id="status-completeness"
            value={Number(settings.status?.completeness) || 0}
            min={-100}
            max={100}
            step={1}
            onValueChange={(value) => updateStatus("completeness", value)}
            aria-label="今日狀態完整度"
          />
        </div>
      </CardContent>
    </Card>
  );
}
