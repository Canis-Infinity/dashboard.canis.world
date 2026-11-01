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
  const settings = { content: value };
  const updateContent = onChange;
  return (
    <Card>
      <CardHeader className="gap-1.5 space-y-0">
        <CardTitle>頁面文案</CardTitle>
        <CardDescription>
          管理首頁導覽、成人提醒、貼文區與關於區塊。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="header-link-label"
            label="右上按鈕文字"
            value={settings.content?.headerLinkLabel}
            onChange={(value) => updateContent("headerLinkLabel", value)}
          />
          <Field
            id="header-link-url"
            label="右上按鈕連結"
            type="url"
            placeholder="例如：http://example.com"
            value={settings.content?.headerLinkUrl}
            onChange={(value) => updateContent("headerLinkUrl", value)}
          />
          <div className="grid gap-2 rounded-lg border bg-muted/20 p-4 md:col-span-2">
            <Label>首頁主視覺</Label>
            <p className="text-sm leading-6 text-muted-foreground">
              每次載入首頁時，會從公開的精選日常隨機選一篇，使用該篇的首張照片、分類、日期、標題與摘要。請到日常紀錄管理精選項目；沒有精選時會顯示一般公開日常。
            </p>
          </div>
        </div>
        <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
          <Field
            id="adult-title"
            label="成人提醒標題"
            value={settings.content?.adultTitle}
            onChange={(value) => updateContent("adultTitle", value)}
          />
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="adult-description">成人提醒內容</Label>
            <Textarea
              id="adult-description"
              placeholder="請輸入成人提醒內容"
              value={settings.content?.adultDescription || ""}
              onChange={(event) =>
                updateContent("adultDescription", event.target.value)
              }
              className="min-h-20"
            />
          </div>
        </div>

        <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
          <Field
            id="gallery-badge"
            label="貼文區標籤"
            value={settings.content?.galleryBadge}
            onChange={(value) => updateContent("galleryBadge", value)}
          />
          <Field
            id="gallery-title"
            label="貼文區標題"
            value={settings.content?.galleryTitle}
            onChange={(value) => updateContent("galleryTitle", value)}
          />
          <Field
            id="about-badge"
            label="關於區標籤"
            value={settings.content?.aboutBadge}
            onChange={(value) => updateContent("aboutBadge", value)}
          />
          <Field
            id="about-title"
            label="關於區標題"
            value={settings.content?.aboutTitle}
            onChange={(value) => updateContent("aboutTitle", value)}
          />
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="about-description">關於區介紹</Label>
            <Textarea
              id="about-description"
              placeholder="請輸入關於區介紹"
              value={settings.content?.aboutDescription || ""}
              onChange={(event) =>
                updateContent("aboutDescription", event.target.value)
              }
              className="min-h-24"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
