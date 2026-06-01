import { Message } from "../types";

interface Props {
  messages: Message[];
  unreadCount: number;
}

export function MessageList({ messages, unreadCount }: Props) {
  return (
    <section className="message-list">
      <h3 className="message-list__heading">
        Messages
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} unread</span>
        )}
      </h3>

      {messages.length === 0 && (
        <p className="message-list__empty">No messages.</p>
      )}

      <div className="message-list__items">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-item ${!msg.read ? "message-item--unread" : ""}`}
          >
            <div className="message-item__top">
              <span className="message-item__from">{msg.from}</span>
              <span className="message-item__date">
                {new Date(msg.receivedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="message-item__subject">{msg.subject}</p>
            <p className="message-item__preview">{msg.preview}</p>
            {!msg.read && <span className="message-item__unread-dot" aria-label="Unread" />}
          </div>
        ))}
      </div>
    </section>
  );
}
