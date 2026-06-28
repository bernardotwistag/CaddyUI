"use client";

import { useMemo } from "react";
import Editor from "@monaco-editor/react";

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
  readOnly?: boolean;
}

export function JsonEditor({
  value,
  onChange,
  onValidityChange,
  readOnly = false,
}: JsonEditorProps) {
  const error = useMemo(() => {
    if (!value) {
      onValidityChange(false);
      return "JSON is empty";
    }
    try {
      JSON.parse(value);
      onValidityChange(true);
      return null;
    } catch (e) {
      onValidityChange(false);
      return (e as Error).message;
    }
  }, [value, onValidityChange]);

  return (
    <div className="space-y-2">
      <div className="h-[calc(100vh-300px)] border rounded-md overflow-hidden">
        <Editor
          value={value}
          onChange={(value) => onChange?.(value ?? "")}
          language="json"
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
