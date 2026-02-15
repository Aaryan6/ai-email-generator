"use client";

import { X, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HistoryChat {
  chatId: string;
  title: string;
  updatedAt: number;
}

interface HistorySidebarProps {
  open: boolean;
  onClose: () => void;
  chats: HistoryChat[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function HistorySidebar({
  open,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
}: HistorySidebarProps) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-[2px]"
      />

      <div className="fixed inset-y-0 left-0 z-50 flex w-[320px] max-w-[90vw] flex-col overflow-hidden border-r border-border/70 bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
          <h3 className="text-sm font-semibold">Chats</h3>
          <Button onClick={onClose} variant="ghost" size="icon-sm" aria-label="Close chat history">
            <X />
          </Button>
        </div>

        <div className="flex-1 space-y-1 overflow-auto p-2">
          {chats.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <MessageSquare className="size-5" />
              <p>No chats yet.</p>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = activeChatId === chat.chatId;
              return (
                <div
                  key={chat.chatId}
                  className={cn(
                    "group flex items-start justify-between rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border/70 hover:bg-muted/40",
                    isActive && "border-border/70 bg-muted/50",
                  )}
                >
                  <div
                    onClick={() => onSelectChat(chat.chatId)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="truncate text-sm font-medium">
                      {chat.title}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.chatId);
                    }}
                    variant="ghost"
                    size="icon-xs"
                    className="ml-2 mt-0.5 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${chat.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
