// @ts-nocheck
"use client";

import { useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { runMutation } from "@/controllers/resourceController";

export function useMutationAction({ successMessage = "操作完成", errorMessage = "操作失敗", onSuccess } = {}) {
  return useCallback(
    async (action) => {
      const result = await runMutation(action, { onSuccess, successMessage });

      if (result.ok) {
        toast.success(result.message || successMessage);
        return result.data;
      }

      toast.error(result.message || errorMessage);
      return null;
    },
    [errorMessage, onSuccess, successMessage]
  );
}
