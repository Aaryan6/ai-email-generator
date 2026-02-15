"use client";

import { useState } from "react";
import { Eye, Code2, Copy, Check, Download, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailPreview } from "./email-preview";
import { CodeViewer } from "./code-viewer";

export interface EmailArtifact {
  name: string;
  description: string;
  tsxCode: string;
  htmlCode: string;
}

interface ArtifactPanelProps {
  email: EmailArtifact | null;
  compilationError?: string | null;
}

export function ArtifactPanel({ email, compilationError }: ArtifactPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleCopyHtml = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(email.htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!email) return;
    const blob = new Blob([email.htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${email.name.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!email) {
    return (
      <div className="grid h-full place-items-center bg-background/40 px-6">
        <Card className="w-full max-w-md border-border/70 bg-card/85 text-center backdrop-blur">
          <CardHeader className="items-center gap-3">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-border/70 bg-muted/50">
              <Eye className="size-7 text-muted-foreground" />
            </div>
            <CardTitle>Email preview</CardTitle>
            <CardDescription>
              Generated templates appear here with live rendering and source code.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-5">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-sm font-semibold md:text-base">{email.name}</h3>
          <Badge variant="outline" className="max-w-full truncate">
            {email.description}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            onClick={() => setActiveTab("preview")}
            variant={activeTab === "preview" ? "secondary" : "ghost"}
            size="sm"
          >
            <Eye data-icon="inline-start" />
            Preview
          </Button>
          <Button
            onClick={() => setActiveTab("code")}
            variant={activeTab === "code" ? "secondary" : "ghost"}
            size="sm"
          >
            <Code2 data-icon="inline-start" />
            Code
          </Button>
          <Button onClick={handleCopyHtml} disabled={!email.htmlCode} variant="outline" size="sm">
            {copiedHtml ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copiedHtml ? "Copied" : "Copy HTML"}
          </Button>
          <Button
            onClick={handleDownloadHtml}
            disabled={!email.htmlCode}
            variant="outline"
            size="icon-sm"
            aria-label="Download HTML"
          >
            <Download />
          </Button>
        </div>
      </div>

      {compilationError && (
        <div className="flex items-start gap-3 border-b border-amber-700/30 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <strong>Compilation Error:</strong> {compilationError}
            <div className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
              The generated code had an error. Ask the AI to fix it or regenerate the template.
            </div>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === "preview" ? (
          email.htmlCode ? (
            <EmailPreview htmlCode={email.htmlCode} />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
              No preview available. Check the Code tab for the generated source.
            </div>
          )
        ) : (
          <CodeViewer code={email.tsxCode} />
        )}
      </div>
    </div>
  );
}
