import { useMessaging, MessagingProvider } from '../../context/MessagingContext';
import { SocketProvider } from '../../context/MessageSimulationContext';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import ResearcherInfoPanel from './ResearcherInfoPanel';
import { Toaster } from '../ui/Toaster';

function MessagesLayout() {
  const { activeConversationId } = useMessaging();

  return (
    <div className="h-full w-full flex overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm relative">
      <Toaster />
      
      <div className={`flex-shrink-0 h-full bg-white border-r border-[#E8EDF5] transition-all duration-300 w-full md:w-[320px] lg:w-[340px] ${activeConversationId ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
        <ConversationsList />
      </div>
      
      <main className={`flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden min-w-0 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <ChatHeader />
        <ChatWindow />
        <MessageInput />
      </main>
      
      <div className="hidden xl:flex w-80 flex-shrink-0 border-l border-[#E8EDF5] bg-white h-full">
        <ResearcherInfoPanel />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <MessagingProvider>
      <SocketProvider>
        <MessagesLayout />
      </SocketProvider>
    </MessagingProvider>
  );
}
