"use client";

import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
  parts?: Array<Record<string, unknown>>;
}

function getToolLabel(part: Record<string, unknown>): string {
  const explicitName = part.toolName;
  if (typeof explicitName === "string" && explicitName.length > 0) {
    return explicitName;
  }

  const type = part.type;
  if (typeof type === "string" && type.startsWith("tool-")) {
    return type.replace("tool-", "");
  }

  return "tool";
}

function getToolState(part: Record<string, unknown>): string {
  const state = part.state;
  if (typeof state === "string" && state.length > 0) {
    return state;
  }
  if ("output" in part) {
    return "output-available";
  }
  if ("input" in part) {
    return "input-available";
  }
  return "unknown";
}

function isToolPart(part: Record<string, unknown>): boolean {
  const type = part.type;
  return typeof type === "string" && type.startsWith("tool-");
}

export function MessageBubble({ role, content, parts }: MessageBubbleProps) {
  const isUser = role === "user";
  const toolParts = (parts ?? []).filter(isToolPart);

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          backgroundColor: isUser ? "#6366f1" : "#1f2937",
          color: "#fff",
        }}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: "12px",
          backgroundColor: isUser ? "#6366f1" : "#1f2937",
          color: isUser ? "#fff" : "#e5e7eb",
          fontSize: "14px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
        {!isUser && toolParts.length > 0 ? (
          <div style={{ marginTop: content ? "10px" : "0", display: "grid", gap: "8px" }}>
            {toolParts.map((part, index) => {
              const label = getToolLabel(part);
              const state = getToolState(part);
              return (
                <div
                  key={`${label}-${index}`}
                  style={{
                    border: "1px solid #374151",
                    borderRadius: "10px",
                    padding: "10px",
                    backgroundColor: "#111827",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#d1d5db", fontWeight: 600 }}>
                      Tool: {label}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{state}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
