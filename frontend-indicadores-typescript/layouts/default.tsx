import { Navbar } from "@/components/navbar";
import { SidebarWrapper } from "@/components/sidebar/sidebar";
import { Link } from "@nextui-org/link";
import { Head } from "./head";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<div className="bg-custom flex">
      <Head />

      <div className="flex flex-grow sidebar-gradient">
        <div className="sticky top-0 h-screen z-10 sidebar-gradient">
          <SidebarWrapper />
        </div>

        <div className="flex flex-col w-full bg-custom">
          <Navbar />
          <main className="text-foreground ">{children}</main>
        </div>
      </div>
    </div>
  );
}
