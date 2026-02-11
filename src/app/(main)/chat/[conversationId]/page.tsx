import { ChatArea } from "@/components/chat/ChatArea";
import { auth } from "@/lib/auth";
import { ConversationRepository } from "@/lib/repositories/conversation.repository";
import { notFound, redirect } from "next/navigation";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const conversation = await ConversationRepository.findById(conversationId);

  if (!conversation) {
    notFound();
  }

  if (conversation.userId !== (session.user as any).id) {
    redirect("/chat");
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatArea conversationId={conversationId} />
    </div>
  );
}
