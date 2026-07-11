import { useMessaging } from '../../context/MessagingContext';
import { CURRENT_USER, formatMsgTime } from '../../data/mockData';
import FileAttachmentCard from './FileAttachmentCard';

export default function MessageBubble({ message, animDelay = 0 }) {
  const { activeConversationId } = useMessaging();
  const isMine = message.senderId === CURRENT_USER.id;
  const time = formatMsgTime(message.createdAt);

  return (
    <div
      className={`flex ${isMine ? 'flex-col items-end ml-auto' : 'items-end gap-3'} max-w-[80%] anim-msg-stagger-in`}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Dusre user ki DP (Avatar) */}
      {!isMine && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#E2E8F0] shadow-sm">
          <img src={message.senderAvatarUrl} alt={message.senderName} className="w-full h-full object-cover" />
        </div>
      )}

      <div className={isMine ? 'flex flex-col items-end gap-1' : ''}>
        {/* Message ka dabba (Bubble) */}
        <div
          className={`px-4 pt-3.5 pb-3 shadow-sm transition-all duration-250
            ${isMine
              ? 'bubble-outbound bubble-outbound-bg text-white'
              : 'bubble-inbound bg-white border border-[#E8EDF5] text-[#0F172A] hover:border-[#C7D2FE]'
            }`}
        >
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}

          {message.attachments?.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((a) => (
                <FileAttachmentCard key={a.id} attachment={a} />
              ))}
            </div>
          )}

          {!isMine && (
            <span className="text-[10px] text-[#94A3B8] mt-2 block">{time}</span>
          )}
        </div>

        {/* Message bhejne ka time aur padha gaya ya nahi (Read receipt) */}
        {isMine && (
          <div className="flex items-center gap-1 mr-1 mt-0.5">
            {message.pending ? (
              <span className="text-[10px] text-[#94A3B8] italic anim-gentle-pulse">Sending…</span>
            ) : (
              <>
                <span className="text-[10px] text-[#94A3B8]">{time}</span>
                {message.readAt && (
                  <span className="text-[10px] text-[#4F46E5] font-semibold anim-read-text">· Read</span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
