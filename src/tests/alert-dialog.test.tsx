import React, { useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function TestAlertDialog() {
  const [open, setOpen] = useState(true)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>精選數量已達上限</AlertDialogTitle>
          <AlertDialogDescription>請先取消一筆精選。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>了解</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe("AlertDialogAction", () => {
  it("closes the alert dialog when clicked", async () => {
    render(<TestAlertDialog />)

    fireEvent.click(screen.getByRole("button", { name: "了解" }))

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull()
    })
  })
})
