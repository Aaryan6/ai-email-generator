"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import type { UIMessage } from "ai";
import { ChatPanel, EmailData } from "@/components/chat-panel";
import { ArtifactPanel, EmailArtifact } from "@/components/artifact-panel";
import { HistorySidebar, type HistoryChat } from "@/components/history-sidebar";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

interface ChatShellProps {
  initialChatId?: string;
  initialMessages?: UIMessage[];
}

export function ChatShell({ initialChatId, initialMessages = [] }: ChatShellProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const bootChatId = useMemo(() => {
    return initialChatId ?? `chat_${crypto.randomUUID()}`;
  }, [initialChatId]);

  const [chatId, setChatId] = useState(bootChatId);
  const [hasPersistedPath, setHasPersistedPath] = useState(Boolean(initialChatId));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<EmailArtifact | null>(null);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"chat" | "preview">("chat");

  const upsertUser = useMutation(api.users.upsertFromSession);
  const deleteChat = useMutation(api.chats.remove);

  const chats = useQuery(api.chats.list, session ? {} : "skip");
  const latestEmail = useQuery(
    api.emails.getLatestForChat,
    session && hasPersistedPath ? { chatId } : "skip",
  );

  const historyChats = useMemo<HistoryChat[]>(() => {
    if (!chats) {
      return [];
    }
    return chats.map((chat: { chatId: string; title: string; updatedAt: number }) => ({
      chatId: chat.chatId,
      title: chat.title,
      updatedAt: chat.updatedAt,
    }));
  }, [chats]);

  const chatInitialMessages = useMemo<UIMessage[]>(() => {
    if (!hasPersistedPath) {
      return [];
    }
    return initialMessages;
  }, [hasPersistedPath, initialMessages]);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    void upsertUser({
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    });
  }, [session?.user, upsertUser]);

  const currentEmail = useMemo<EmailArtifact | null>(() => {
    if (previewEmail) {
      return previewEmail;
    }
    if (!latestEmail) {
      return null;
    }
    return {
      name: latestEmail.name,
      description: latestEmail.description,
      tsxCode: latestEmail.tsxCode,
      htmlCode: latestEmail.htmlCode,
    };
  }, [latestEmail, previewEmail]);

  const handleGoogleSignIn = useCallback(async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: initialChatId ? `/chat/${initialChatId}` : "/chat",
    });
  }, [initialChatId]);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    setPreviewEmail(null);
    setCompilationError(null);
    setActivePanel("chat");
    setSidebarOpen(false);
    router.replace("/chat");
  }, [router]);

  const handleEnsureChatPath = useCallback((nextChatId: string) => {
    if (!hasPersistedPath) {
      setChatId(nextChatId);
      window.history.replaceState({}, "", `/chat/${nextChatId}`);
      setHasPersistedPath(true);
    }
  }, [hasPersistedPath]);

  const handleEmailGenerated = useCallback((data: EmailData) => {
    if (!data.success) {
      setCompilationError(data.error || "Failed to compile email template");
      if (data.tsxCode) {
        setPreviewEmail({
          name: data.name,
          description: data.description,
          tsxCode: data.tsxCode,
          htmlCode: "",
        });
        setActivePanel("preview");
      }
      return;
    }

    setCompilationError(null);
    setPreviewEmail({
      name: data.name,
      description: data.description,
      tsxCode: data.tsxCode,
      htmlCode: data.htmlCode,
    });
    setActivePanel("preview");
  }, []);

  const handleSelectChat = useCallback((selectedChatId: string) => {
    setSidebarOpen(false);
    router.push(`/chat/${selectedChatId}`);
  }, [router]);

  const handleDeleteChat = useCallback(async (selectedChatId: string) => {
    await deleteChat({ chatId: selectedChatId });
    if (selectedChatId === chatId) {
      setPreviewEmail(null);
      router.replace("/chat");
    }
  }, [chatId, deleteChat, router]);

  const handleNewChat = useCallback(() => {
    setSidebarOpen(false);
    setPreviewEmail(null);
    setCompilationError(null);
    setActivePanel("chat");
    const nextChatId = `chat_${crypto.randomUUID()}`;
    setChatId(nextChatId);
    setHasPersistedPath(false);
    window.history.replaceState({}, "", "/chat");
  }, []);

  if (sessionPending) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#0d1117",
          color: "#9ca3af",
          fontSize: "14px",
        }}
      >
        Checking session...
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#0d1117",
          color: "#f9fafb",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "24px",
            backgroundColor: "#111827",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
            Sign in to continue
          </h1>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: "14px" }}>
            Use Google to access your saved chats and generated emails.
          </p>
          <button
            onClick={handleGoogleSignIn}
            style={{
              marginTop: "8px",
              border: "1px solid #374151",
              borderRadius: "10px",
              backgroundColor: "#1f2937",
              color: "#f9fafb",
              fontSize: "14px",
              fontWeight: 600,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          position: "fixed",
          top: "12px",
          right: "12px",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "999px",
          padding: "6px 8px 6px 12px",
        }}
      >
        <span style={{ color: "#9ca3af", fontSize: "12px" }}>
          {session.user.email ?? "Signed in"}
        </span>
        <button
          onClick={handleSignOut}
          style={{
            border: "none",
            borderRadius: "999px",
            backgroundColor: "#1f2937",
            color: "#f3f4f6",
            fontSize: "12px",
            fontWeight: 600,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <HistorySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={historyChats}
        activeChatId={hasPersistedPath ? chatId : undefined}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      <div
        className="mobile-tabs"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          borderTop: "1px solid #1f2937",
          backgroundColor: "#111827",
        }}
      >
        <button
          onClick={() => setActivePanel("chat")}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            backgroundColor: activePanel === "chat" ? "#1f2937" : "transparent",
            color: activePanel === "chat" ? "#6366f1" : "#9ca3af",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActivePanel("preview")}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            backgroundColor: activePanel === "preview" ? "#1f2937" : "transparent",
            color: activePanel === "preview" ? "#6366f1" : "#9ca3af",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Preview
        </button>
      </div>

      <div
        className="chat-panel-container"
        data-active={activePanel === "chat"}
        style={{ width: "420px", minWidth: "360px", flexShrink: 0, height: "100%" }}
      >
        <ChatPanel
          key={chatId}
          chatId={chatId}
          initialMessages={chatInitialMessages}
          onEmailGenerated={handleEmailGenerated}
          onEnsureChatPath={handleEnsureChatPath}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
        />
      </div>

      <div
        className="artifact-panel-container"
        data-active={activePanel === "preview"}
        style={{ flex: 1, height: "100%", minWidth: 0 }}
      >
        <ArtifactPanel email={currentEmail} compilationError={compilationError} />
      </div>
    </div>
  );
}
