
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold text-patent-blue ml-2">Patent Insight Agent</h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
