"use client";
import SettingsPage from "@/components/features/canis-world/SettingsPage";
import Form from "@/components/features/canis-world/ProfileForm";
export default function Page() {
  return <SettingsPage section="profile" Form={Form} />;
}
