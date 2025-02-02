"use client";

import { useEffect, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic validation - can be enhanced later
    if (value.trim()) {
      setError(null);
      onValidityChange(true);
    } else {
      setError("Caddyfile is empty");
      onValidityChange(false);
    }
  }, [value, onValidityChange]);

  return (
    <div className="space-y-2">
      <div className="h-[calc(100vh-300px)] border rounded-md overflow-hidden">
        <Editor
          value={value}
          onChange={(value) => onChange?.(value ?? "")}
          language="nginx" // Using nginx highlighting as it's close to Caddyfile syntax
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