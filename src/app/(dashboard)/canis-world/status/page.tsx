"use client";
import SettingsPage from "@/components/features/canis-world/SettingsPage";
import Form from "@/components/features/canis-world/StatusForm";
export default function Page() {
  return <SettingsPage section="status" Form={Form} />;
}
