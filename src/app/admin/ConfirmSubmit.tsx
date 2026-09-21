"use client";

/**
 * A submit button that asks first. Used for the one action in the panel that
 * cannot be undone, so an accidental click cannot destroy a record.
 */
export function ConfirmSubmit({
  children,
  confirmText,
  className = "btn btn-ghost btn-sm",
}: {
  children: React.ReactNode;
  confirmText: string;
  className?: string;
}) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
