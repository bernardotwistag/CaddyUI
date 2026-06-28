"use client";

import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";

interface CaddyfileEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
  readOnly?: boolean;
}

export function CaddyfileEditor({
  value,
  onChange,
  onValidityChange,
  readOnly = false,
}: CaddyfileEditorProps) {
  const [error, setError] = useState<string | null>(() => {
    return value.trim() ? null : "Caddyfile is empty";
  });

  const handleChange = useCallback((newValue: string | undefined) => {
    const val = newValue ?? "";
    const isEmpty = !val.trim();
    setError(isEmpty ? "Caddyfile is empty" : null);
    onValidityChange(!isEmpty);
    onChange?.(val);
  }, [onChange, onValidityChange]);

  return (
    <div className="space-y-2">
      <div className="h-[calc(100vh-300px)] border rounded-md overflow-hidden">
        <Editor
          value={value}
          onChange={handleChange}
          language="nginx"
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
