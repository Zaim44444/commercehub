"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { updateUserStatus } from "./actions";

type Props = {
  userId: string;
  fullName: string;
  isActive: boolean;
  isCurrentUser: boolean;
};

export function UserStatusButton({
  userId,
  fullName,
  isActive,
  isCurrentUser,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const action = isActive ? "Deactivate" : "Activate";

  function handleConfirm() {
    setError("");

    startTransition(async () => {
      try {
        const result = await updateUserStatus(userId, !isActive);

        if (!result.ok) {
          setError(result.message);
          return;
        }

        setOpen(false);
      } catch {
        setError(
          "Unable to confirm the update. Refresh to check the account status.",
        );
      }
    });
  }

  if (isCurrentUser) {
    return (
      <span className="text-sm text-muted-foreground">
        Your account
      </span>
    );
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={
          isActive
            ? "text-red-600 hover:text-red-700"
            : "text-emerald-700 hover:text-emerald-800"
        }
        aria-label={`${action} ${fullName}`}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        {action}
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!pending) {
            setOpen(nextOpen);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action} account?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {isActive
                ? `${fullName} will lose access to protected features. You can reactivate this account later.`
                : `${fullName} will be allowed to sign in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              Cancel
            </AlertDialogCancel>

            <Button
              type="button"
              variant={isActive ? "destructive" : "default"}
              disabled={pending}
              onClick={handleConfirm}
            >
              {pending ? "Saving..." : `${action} account`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}