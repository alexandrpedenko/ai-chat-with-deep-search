import { ChatPageWrapper } from "./chat-wrapper";
import { auth } from "~/server/auth";
import { getChats, getChat } from "~/server/db/chat";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const session = await auth();
  
  // Fetch user's chats if authenticated
  let userChats: Awaited<ReturnType<typeof getChats>> = [];
  let currentChat: Awaited<ReturnType<typeof getChat>> | null = null;
  
  if (session?.user?.id) {
    // Always fetch the user's chats for the sidebar
    userChats = await getChats(session.user.id);
    
    // If there's a chat ID in the URL, fetch that specific chat
    if (id) {
      currentChat = await getChat(id, session.user.id);
    }
  }
  
  return (
    <ChatPageWrapper 
      chatId={id} 
      userChats={userChats}
      currentChat={currentChat}
    />
  );
}