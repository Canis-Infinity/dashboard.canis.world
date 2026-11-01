// @ts-nocheck
"use client";
import { useCallback } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { ContentCollections } from "./ContentCollections";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { getCanisWorldAdmin } from "@/services/canisWorldService";
import { WORLD_NAVIGATION } from "@/config/navigation";

export default function CollectionPage({ section }) {
  const fetchData = useCallback(() => getCanisWorldAdmin(), []);
  const { data, loading, error, refetch } = useAsyncResource(fetchData, [], {
    initialData: null,
  });
  const item = WORLD_NAVIGATION.find((item) => item.section === section);
  return (
    <DashboardShell title={item.title} description={item.description}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>讀取失敗</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading || !data ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <ContentCollections
          faqs={section === "faqs" ? data.faqs || [] : []}
          featureCards={section === "features" ? data.featureCards || [] : []}
          activeSection={section}
          onChanged={refetch}
        />
      )}
    </DashboardShell>
  );
}
