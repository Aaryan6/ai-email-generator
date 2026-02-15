"use client";

import { useChat } from "@ai-sdk/react";
import { Send, PanelLeftOpen, Plus, Loader2 } from "lucide-react";
import { useEffect, useRef, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./message-bubble";
import type { UIMessage } from "ai";

export interface EmailData {
  name: string;
  description: string;
  tsxCode: string;
  htmlCode: string;
  success: boolean;
  error?: string;
}

interface ChatPanelProps {
  chatId: string;
  initialMessages: UIMessage[];
  onEmailGenerated: (data: EmailData) => void;
  onEnsureChatPath: (chatId: string) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

function getMessageText(
  parts: Array<{ type: string; text?: string }>
): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

function hasToolParts(parts: Array<{ type?: string }>): boolean {
  return parts.some((part) => {
    if (typeof part.type !== "string") {
      return false;
    }
    return part.type.startsWith("tool-");
  });
}

export function ChatPanel({
  chatId,
  initialMessages,
  onEmailGenerated,
  onEnsureChatPath,
  onToggleSidebar,
  onNewChat,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedToolCallsRef = useRef<Set<string>>(new Set());
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, setMessages } = useChat({
    id: chatId,
    messages: initialMessages,
  });

  const isLoading = status === "streaming" || status === "submitted";
  const suggestions = [
    "Welcome email with hero banner and CTA",
    "Password reset notification",
    "Monthly newsletter with sections",
    "Order confirmation with details",
  ];

  // Detect email generation from tool parts in messages
  useEffect(() => {
    for (const message of messages) {
      if (message.role !== "assistant" || !message.parts) continue;
      for (const part of message.parts) {
        if (
          "toolCallId" in part &&
          typeof part.toolCallId === "string" &&
          "state" in part &&
          part.state === "output-available" &&
          "output" in part &&
          !processedToolCallsRef.current.has(part.toolCallId)
        ) {
          processedToolCallsRef.current.add(part.toolCallId);
          onEmailGenerated(part.output as EmailData);
        }
      }
    }
  }, [messages, onEmailGenerated]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    processedToolCallsRef.current.clear();
    setInput("");
    onNewChat();
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;

    if (messages.length === 0) {
      onEnsureChatPath(chatId);
    }

    setInput("");
    sendMessage({ text });
  };

  // Filter displayable messages
  const displayMessages = useMemo(() => {
    return messages.filter((m) => {
      if (m.role === "user") return true;
      if (m.role === "assistant") {
        const parts = m.parts as Array<{ type?: string; text?: string }>;
        const text = getMessageText(parts as Array<{ type: string; text?: string }>);
        return text.trim().length > 0 || hasToolParts(parts);
      }
      return false;
    });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button onClick={onToggleSidebar} variant="ghost" size="icon-sm" aria-label="Open chats">
            <PanelLeftOpen />
          </Button>
          <h2 className="text-sm font-semibold">AI Email Generator</h2>
          <Badge variant="outline" className="hidden sm:inline-flex">
            React Email
          </Badge>
        </div>
        <Button onClick={handleNewChat} variant="outline" size="sm">
          <Plus data-icon="inline-start" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-1 py-2">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-14 place-items-center rounded-2xl border border-border/60 bg-muted/40 text-2xl">
              ✉
            </div>
            <h3 className="text-lg font-semibold">Create beautiful emails with AI</h3>
            <p className="max-w-xs text-sm text-muted-foreground">
              Describe the campaign, tone, and layout. We will generate a production-ready React Email template.
            </p>
            <div className="mt-2 grid w-full max-w-sm gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  variant="outline"
                  className="h-auto justify-start whitespace-normal py-2 text-left text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={getMessageText(
              message.parts as Array<{ type: string; text?: string }>
            )}
            parts={message.parts as Array<Record<string, unknown>>}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Generating...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/60 bg-background/70 px-4 py-4 pb-24 md:pb-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe the email you want to create..."
            rows={2}
            className="max-h-40 min-h-[56px]"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className={cn("mb-1 shrink-0", !input.trim() && "opacity-60")}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
