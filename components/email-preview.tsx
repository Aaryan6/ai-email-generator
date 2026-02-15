"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EmailPreviewProps {
  htmlCode: string;
}

export function EmailPreview({ htmlCode }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-border/60 px-4 py-2.5">
        <Button
          onClick={() => setViewMode("desktop")}
          variant={viewMode === "desktop" ? "secondary" : "ghost"}
          size="sm"
        >
          <Monitor data-icon="inline-start" />
          Desktop
        </Button>
        <Button
          onClick={() => setViewMode("mobile")}
          variant={viewMode === "mobile" ? "secondary" : "ghost"}
          size="sm"
        >
          <Smartphone data-icon="inline-start" />
          Mobile
        </Button>
      </div>
      <div className="flex flex-1 justify-center overflow-auto bg-muted/35 p-4 md:p-6">
        <iframe
          srcDoc={htmlCode}
          title="Email Preview"
          sandbox="allow-same-origin"
          className="h-full rounded-xl border border-border bg-white shadow-sm"
          style={{ width: viewMode === "desktop" ? "100%" : "375px", maxWidth: "680px" }}
        />
      </div>
    </div>
  );
}
