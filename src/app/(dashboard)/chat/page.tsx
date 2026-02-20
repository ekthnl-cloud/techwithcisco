import { ChatList } from "@/components/chat/ChatRoom";

export default function ChatPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Chat</h1>
        <ChatList />
      </div>
    </div>
  );
}
