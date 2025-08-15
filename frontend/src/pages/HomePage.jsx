import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="relative w-full max-w-7xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl backdrop-blur-xl bg-black/40 overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 z-0 opacity-20 animate-pulse-slow">
          <div className="absolute top-1/2 left-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-fuchsia-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-sky-500 rounded-full blur-3xl"></div>
        </div>

        {/* Gradient Border Overlay */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl z-10 p-px">
          <div className="absolute inset-0 rounded-[calc(0.5rem-1px)] sm:rounded-[calc(1rem-1px)] lg:rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-neutral-800 to-neutral-600 opacity-50"></div>
        </div>

        {/* Main Content */}
        <div className="flex h-full rounded-xl sm:rounded-2xl lg:rounded-3xl relative z-20">
          <Sidebar />
          {/* Only show the chat container on medium screens and up if a user is selected */}
          {selectedUser ? (
            <ChatContainer className="flex-1" />
          ) : (
            <NoChatSelected />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;