import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Users,
  Sparkles,
  Bell,
  LogOut,
  Menu,
  UserCircle,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { items: cartItems, total: cartTotalAmt } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Soft auth gate — bounce to /auth if not signed in (client only).
  useEffect(() => {
    if (mounted && !user) {
      navigate({ to: "/auth" });
    }
  }, [mounted, user, navigate]);

  const role = mounted ? user?.role : undefined;
  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["customer", "provider"] },
    { to: "/providers", label: "Find Providers", icon: Search, roles: ["customer"] },
    { to: "/cart", label: "Cart", icon: ShoppingCart, roles: ["customer"] },
    { to: "/bookings", label: "My Bookings", icon: CalendarCheck, roles: ["customer"] },
    { to: "/provider-portal", label: "Provider Portal", icon: Users, roles: ["provider"] },
    { to: "/insights", label: "AI Insights", icon: Sparkles, roles: ["customer", "provider"] },
  ].filter((n) => !role || n.roles.includes(role));

  return (
    <div className="min-h-screen flex bg-background">
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold leading-none">ServiceAI</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              {role === "provider" ? "Provider Console" : "Booking Platform"}
            </div>
          </div>
        </div>
        <nav className="px-3 py-6 space-y-1">
          {nav.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-1">
          {role === "provider" && (
            <Link
              to="/provider-portal"
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <UserCircle className="size-4" /> My profile
            </Link>
          )}
          <button
            onClick={() => {
              signOut();
              navigate({ to: "/auth" });
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            {title && <h1 className="text-lg font-display font-semibold">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            {mounted && role === "customer" && (
              <Link
                to="/cart"
                className="relative inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
                title="Cart"
              >
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">₹{cartTotalAmt}</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-gradient-primary text-white text-[10px] font-bold grid place-items-center shadow-glow">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}
            <button className="relative p-2 rounded-md hover:bg-muted" title="Notifications">
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent animate-pulse-glow" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l">
              <img
                src={(mounted && user?.avatar) || "https://i.pravatar.cc/80?img=12"}
                alt=""
                className="size-8 rounded-full ring-2 ring-primary/20"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-medium leading-none">{(mounted && user?.name) || "Guest"}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {(mounted && user?.role) || "visitor"}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
