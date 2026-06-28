"use client";

import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
  readOnly?: boolean;
}

function validateJson(value: string): string | null {
  if (!value) return "JSON is empty";
  try {
    JSON.parse(value);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

export function JsonEditor({
  value,
  onChange,
  onValidityChange,
  readOnly = false,
}: JsonEditorProps) {
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(() => {
    const err = validateJson(value);
    return err;
  });

  const handleChange = useCallback((newValue: string | undefined) => {
    const val = newValue ?? "";
    const err = validateJson(val);
    setError(err);
    onValidityChange(!err);
    onChange?.(val);
  }, [onChange, onValidityChange]);

  return (
    <div className="space-y-2">
      <div className="h-[calc(100vh-300px)] border rounded-md overflow-hidden">
        <Editor
          value={value}
          onChange={handleChange}
          language="json"
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
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
