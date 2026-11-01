// @ts-nocheck
"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Field from "./SettingsField";

export default function SettingsForm({ value, onChange }) {
  const settings = { footer: value };
  const updateFooter = onChange;
  return (
    <Card>
      <CardHeader className="gap-1.5 space-y-0">
        <CardTitle>頁尾版權</CardTitle>
        <CardDescription>
          設定 canis.world 頁尾顯示的擁有者、連結與權利文字。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field
          id="footer-owner"
          label="擁有者名稱"
          value={settings.footer?.owner}
          onChange={(value) => updateFooter("owner", value)}
        />
        <Field
          id="footer-owner-url"
          label="擁有者連結"
          type="url"
          placeholder="例如：http://example.com"
          value={settings.footer?.ownerUrl}
          onChange={(value) => updateFooter("ownerUrl", value)}
        />
        <div className="md:col-span-2">
          <Field
            id="footer-rights"
            label="權利文字"
            value={settings.footer?.rightsText}
            onChange={(value) => updateFooter("rightsText", value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
