// @ts-nocheck
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import {
  getCanisWorldAdmin,
  updateCanisWorldSettings,
} from "@/services/canisWorldService";
import { getErrorMessage } from "@/utils/apiError";
import { WORLD_NAVIGATION } from "@/config/navigation";

export function buildSettingsPayload(section, value) {
  if (section !== "profile") return { [section]: value };
  const { traitsText, ...profile } = value;
  return {
    profile: {
      ...profile,
      traits: (traitsText ?? (profile.traits || []).join(","))
        .split(",")
        .map((trait) => trait.trim())
        .filter(Boolean),
    },
  };
}

export default function SettingsPage({ section, Form }) {
  const fetchData = useCallback(() => getCanisWorldAdmin(), []);
  const { data, loading, error, refetch } = useAsyncResource(fetchData, [], {
    initialData: null,
  });
  const [value, setValue] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  const item = WORLD_NAVIGATION.find((item) => item.section === section);

  useEffect(() => {
    if (data) setValue(data[section] || {});
  }, [data, section]);
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving) formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving]);

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const result = await updateCanisWorldSettings(
        buildSettingsPayload(section, value),
      );
      toast.success(result.message || "設定已儲存");
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "設定儲存失敗"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell title={item.title} description={item.description}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>讀取失敗</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading || !value ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <form ref={formRef} onSubmit={save} className="grid gap-6">
          <Form
            value={value}
            onChange={(key, next) =>
              setValue((current) => ({ ...current, [key]: next }))
            }
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="size-4" />
              {saving ? "儲存中..." : "儲存設定"}
            </Button>
          </div>
        </form>
      )}
    </DashboardShell>
  );
}
