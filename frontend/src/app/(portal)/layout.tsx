import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/portal/SignOutButton";
import Logo from "@/components/layout/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/equipment", label: "My Equipment" },
  { href: "/service-history", label: "Service History" },
  { href: "/compliance", label: "Compliance" },
  { href: "/chatbot", label: "AI Assistant" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-industrial-950">
      {/* Top bar */}
      <header className="bg-industrial-950/95 backdrop-blur-xl border-b border-industrial-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="h-8 w-auto" showText={false} />
              <span className="font-bold text-white">Rams @Elec</span>
              <span className="text-xs text-industrial-500 ml-1 bg-industrial-800 px-2 py-0.5 rounded-full">Portal</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-industrial-400">
                {session.user.name}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-industrial-900 rounded-xl border border-industrial-800 p-3 space-y-1 sticky top-24">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-industrial-400 hover:bg-brand-500/10 hover:text-brand-400 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-industrial-950 border-t border-industrial-800 z-40">
            <div className="flex justify-around py-2">
              {NAV_ITEMS.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 text-xs text-industrial-500 hover:text-brand-400"
                >
                  {item.label.split(" ")[0]}
                </Link>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
