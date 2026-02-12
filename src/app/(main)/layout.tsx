import { Sidebar } from "@/components/sidebar/Sidebar";
import { ConversationsProvider } from "@/contexts/ConversationsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConversationsProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <Sidebar />
          <main className="relative flex h-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </ConversationsProvider>
  );
}
