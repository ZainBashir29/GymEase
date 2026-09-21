import {
  MessageCircle,
  X,
  ChevronLeft,
  Send,
  Users,
  UserRound,
  ArrowLeft,
  Plus,
  Check,
  CheckCheck,
} from "lucide-react";
import { useChat } from "../../context/ChatContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useState, useRef, useEffect } from "react";

const ChatWidget = () => {
  const { user } = useAuth();
  const {
    isChatOpen,
    toggleChatWindow,
    unreadCount,
    unreadCounts,
    conversations,
    activeConversation,
    openConversation,
    closeConversation,
    messages,
    sendMessage,
    onlineUsers,
    contacts,
    fetchContacts,
    startConversation,
  } = useChat();

  const [messageText, setMessageText] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Reset to Messages view whenever the widget is closed
  useEffect(() => {
    if (!isChatOpen) {
      setShowContacts(false);
    }
  }, [isChatOpen]);

  if (!user) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const receiverId = activeConversation.participants.find(
      (p) => String(p._id) !== String(user._id),
    )?._id;
    if (receiverId) {
      sendMessage(activeConversation._id, receiverId, messageText);
      setMessageText("");
    }
  };

  const getOtherParticipant = (participants) => {
    return participants?.find((p) => String(p._id) !== String(user._id));
  };

  return (
    <>
      <button
        onClick={toggleChatWindow}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        {isChatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        {unreadCount > 0 && !isChatOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-80 sm:w-96 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all">
          <div className="flex items-center bg-brand-600 px-4 py-3 text-white">
            {activeConversation || showContacts ? (
              <button
                onClick={() => {
                  if (showContacts) setShowContacts(false);
                  else closeConversation();
                }}
                className="mr-2 hover:bg-brand-700 rounded-full p-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}

            <div className="flex-1 font-semibold">
              {activeConversation ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold overflow-hidden">
                      {getOtherParticipant(activeConversation.participants)
                        ?.profilePicture ? (
                        <img
                          src={
                            getOtherParticipant(activeConversation.participants)
                              .profilePicture
                          }
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getOtherParticipant(activeConversation.participants)
                          ?.fullName.charAt(0)
                          .toUpperCase()
                      )}
                    </div>
                    {onlineUsers.has(
                      String(
                        getOtherParticipant(activeConversation.participants)
                          ?._id,
                      ),
                    ) && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-brand-600 z-10"></span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm">
                      {
                        getOtherParticipant(activeConversation.participants)
                          ?.fullName
                      }
                    </div>
                    <div className="text-[10px] text-brand-200">
                      {onlineUsers.has(
                        String(
                          getOtherParticipant(activeConversation.participants)
                            ?._id,
                        ),
                      )
                        ? "Online"
                        : "Offline"}
                    </div>
                  </div>
                </div>
              ) : showContacts ? (
                <span className="text-lg">New Chat</span>
              ) : (
                <span className="text-lg">Messages</span>
              )}
            </div>
            {!activeConversation && !showContacts && (
              <button
                onClick={() => {
                  fetchContacts();
                  setShowContacts(true);
                }}
                className="mr-2 hover:bg-brand-700 rounded-full p-1 transition-colors cursor-pointer"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={toggleChatWindow}
              className="hover:bg-brand-700 rounded-full p-1 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
            {showContacts ? (
              <div className="flex-1 overflow-y-auto">
                {contacts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <Users className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">No available contacts.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {contacts.map((contact) => (
                      <li
                        key={contact._id}
                        onClick={() => {
                          startConversation(contact._id);
                          setShowContacts(false);
                        }}
                        className="flex cursor-pointer items-center p-4 hover:bg-slate-100 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold overflow-hidden">
                            {contact.profilePicture ? (
                              <img
                                src={contact.profilePicture}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              contact.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          {onlineUsers.has(String(contact._id)) && (
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white z-10 shadow-sm"></span>
                          )}
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {contact.fullName}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {contact.role}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : !activeConversation ? (
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm">
                      You don't have any conversations yet.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {conversations.map((conv) => {
                      const other = getOtherParticipant(conv.participants);
                      const isOnline = onlineUsers.has(String(other?._id));
                      const convUnread =
                        (unreadCounts || {})[String(conv._id)] || 0;

                      return (
                        <li
                          key={conv._id}
                          onClick={() => openConversation(conv)}
                          className={`flex cursor-pointer items-center p-4 transition-colors ${convUnread > 0 ? "bg-brand-50 hover:bg-brand-100" : "hover:bg-slate-100"}`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold overflow-hidden">
                              {other?.profilePicture ? (
                                <img
                                  src={other.profilePicture}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                other?.fullName.charAt(0).toUpperCase()
                              )}
                            </div>
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white z-10 shadow-sm"></span>
                            )}
                          </div>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p
                                className={`truncate text-sm ${convUnread > 0 ? "font-bold text-brand-900" : "font-medium text-slate-900"}`}
                              >
                                {other?.fullName}
                              </p>
                              {convUnread > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm">
                                  {convUnread > 9 ? "9+" : convUnread}
                                </span>
                              )}
                            </div>
                            <p
                              className={`truncate text-xs mt-1 ${convUnread > 0 ? "font-semibold text-brand-700" : "text-slate-500"}`}
                            >
                              {conv.lastMessage || "Start a conversation"}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => {
                    const isMe =
                      String(msg.senderId?._id || msg.senderId) ===
                      String(user._id);
                    return (
                      <div
                        key={msg._id || index}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-brand-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"}`}
                        >
                          <p>{msg.messageText}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? "text-brand-200" : "text-slate-400"}`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.isRead ? (
                                  <CheckCheck
                                    className="h-3.5 w-3.5 text-white inline"
                                    title="Read"
                                  />
                                ) : (
                                  <Check
                                    className="h-3.5 w-3.5 text-brand-200 inline"
                                    title="Sent"
                                  />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200 bg-white p-3">
                  <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white disabled:bg-slate-300 transition-colors hover:bg-brand-700 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
