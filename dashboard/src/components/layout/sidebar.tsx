"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";

export function Sidebar() {
  const pathname = usePathname();
  const { isSuperAdmin, isClientAdmin, isClientViewer, clientId } = useRole();

  const items: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    match?: (href: string) => boolean;
  }[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  if (isSuperAdmin) {
    items.push({ href: "/clients", label: "Clients", icon: Users });
  } else if (isClientAdmin || isClientViewer) {
    if (clientId) {
      items.push({
        href: `/clients/${clientId}`,
        label: "My Client",
        icon: Building2,
        match: (href) =>
          href === `/clients/${clientId}` ||
          href.startsWith(`/clients/${clientId}/`),
      });
    }
  }

  items.push({ href: "/settings/profile", label: "Settings", icon: Settings });

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Activity className="h-5 w-5 text-primary" />
        <span className="font-semibold">API Monitor</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active =
            item.match?.(pathname) ??
            (pathname === item.href || pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
