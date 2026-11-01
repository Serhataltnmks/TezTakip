"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Inbox,
  Menu,
  ShieldCheck,
  User,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";
import { SignOutButton } from "./sign-out-button";
import { ThemeToggle } from "./theme-toggle";

const icons = {
  home: Home,
  bell: Bell,
  file: FileText,
  graduation: GraduationCap,
  user: User,
  userRound: UserRound,
  inbox: Inbox,
  users: Users,
  clipboard: ClipboardList,
  shield: ShieldCheck,
  userPlus: UserPlus,
  building: Building2,
  calendar: Calendar,
  chart: BarChart3,
};

export type NavItem = { href: string; label: string; icon: keyof typeof icons };

export function DashboardShell({
  title,
  nav,
  notificationsHref,
  userName,
  themeClass,
  children,
}: {
  title: string;
  nav: NavItem[];
  notificationsHref: string;
  userName: string;
  themeClass?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const Icon = icons[item.icon];
        const active = pathname === item.href || (item.href !== nav[0]?.href && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
              active && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("min-h-screen bg-muted/30", themeClass)}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background p-4 md:block">
        <div className="mb-6 px-2">
          <p className="text-xs uppercase text-muted-foreground">Tez Takip</p>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {links}
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menü">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <p className="mb-4 font-semibold">{title}</p>
                {links}
              </SheetContent>
            </Sheet>
            <span className="text-sm text-muted-foreground">{userName}</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell href={notificationsHref} />
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
