import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import api from "../lib/axios.js";

const ChatContext = createContext(undefined);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const token =
      getCookie("accessToken") || localStorage.getItem("accessToken");

    const newSocket = io(
      import.meta.env.VITE_API_BASE_URL.replace("/api/v1", ""),
      {
        auth: { token },
        withCredentials: true,
      },
    );

    newSocket.on("connect", () => {
      console.log("Connected to chat socket");
    });

    newSocket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const convId = String(message?.conversationId);
      if (activeConversation && convId === String(activeConversation._id)) {
        setMessages((prev) => [...prev, message]);
      }

      if (isChatOpen) {
        socket.emit("markAsRead", {
          conversationId: convId,
        });
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
        setUnreadCount((prev) => prev + 1);
      }

      setConversations((prev) => {
        const idx = prev.findIndex((c) => String(c._id) === convId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx].lastMessage = message?.messageText || "New message";
          const [conversation] = updated.splice(idx, 1);
          return [conversation, ...updated];
        } else {
          fetchConversations();
        }

        return prev;
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, activeConversation, isChatOpen]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data } = await api.get("/conversations/me");
      const convs = data.data || [];
      setConversations(convs);
      const initialUnread = {};
      let totalUnread = 0;
      convs.forEach((c) => {
        if (c.unreadCount > 0) {
          initialUnread[String(c._id)] = c.unreadCount;
          totalUnread += c.unreadCount;
        }
      });
      setUnreadCounts(initialUnread);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      setMessages(data.data || []);
      if (socket) {
        socket.emit("markAsRead", { conversationId });
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const toggleChatWindow = () => {
    setIsChatOpen((prev) => !prev);
  };

  const openConversation = (conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation._id);
    setUnreadCounts((prev) => {
      const next = { ...prev };
      const idStr = String(conversation._id);
      const convUnread = next[idStr] || 0;
      delete next[idStr];
      setUnreadCount((current) => Math.max(0, current - convUnread));
      return next;
    });
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
  };

  const closeConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const sendMessage = (conversationId, receiverId, messageText) => {
    if (!socket) return;

    socket.emit(
      "sendMessage",
      { conversationId, receiverId, messageText },
      (response) => {
        if (response.success) {
          setMessages((prev) => [...prev, response.message]);

          setConversations((prev) => {
            const idx = prev.findIndex(
              (c) => String(c._id) === String(conversationId),
            );
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx].lastMessage =
                response?.message?.messageText || "Sent message";
              const [conv] = updated.splice(idx, 1);
              return [conv, ...updated];
            }
            return prev;
          });
        } else {
          console.error("Failed to send message via socket", response.message);
        }
      },
    );
  };

  const checkUserOnlineStatus = useCallback(
    (userId) => {
      if (!socket) return false;
      socket.emit("checkOnlineStatus", { userId }, ({ isOnline }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (isOnline) newSet.add(userId);
          else newSet.delete(userId);
          return newSet;
        });
      });
    },
    [socket],
  );

  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/conversations/contacts");
      setContacts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    }
  };

  const startConversation = async (receiverId) => {
    try {
      const { data } = await api.post("/conversations/create", { receiverId });
      const newConv = data.data;

      setConversations((prev) => {
        if (!prev.find((c) => String(c._id) === String(newConv._id))) {
          return [newConv, ...prev];
        }
        return prev;
      });
      openConversation(newConv);
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        onlineUsers,
        isChatOpen,
        toggleChatWindow,
        conversations,
        activeConversation,
        openConversation,
        closeConversation,
        messages,
        sendMessage,
        unreadCount,
        unreadCounts,
        checkUserOnlineStatus,
        fetchConversations,
        contacts,
        fetchContacts,
        startConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
