import { useEffect, useRef } from "react";
// import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Anchor,
  ChevronLeft,
  ChevronRight,
  Fish,
  LayoutDashboard,
  LogOut,
  Route,
  ShieldCheck,
  Ship,
  TreePine,
  Users,
  X,
} from "lucide-react";
// import {
//   Anchor,
//   Camera,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   ChevronUp,
//   Fish,
//   LayoutDashboard,
//   LogOut,
//   Route,
//   ShieldCheck,
//   Ship,
//   TreePine,
//   Users,
//   X,
//   FileWarning,
// } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import logoRajaAmpat from "@/assets/KKP-RajaAmpat.png";
import motifSidebar from "@/assets/motif-sidebar.svg";

const mainNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/crew", icon: Users, label: "Personel" },
  { to: "/guard-posts", icon: Anchor, label: "Pelabuhan/Pos Jaga" },
  { to: "/speedboats", icon: Ship, label: "Management Speedboat" },
  { to: "/monitoring-megafauna", icon: Fish, label: "Monitoring Pemanfaatan (RUM)" },
  { to: "/monitoring-habitat", icon: TreePine, label: "Monitoring Habitat" },
  { to: "/patrols", icon: Route, label: "Patroli" },
];

// const patrolGroupItems = [
//   { to: "/patrols", icon: Route, label: "Daftar Patroli" },
//   { to: "/incidents", icon: FileWarning, label: "Laporan Kejadian" },
//   { to: "/findings", icon: Camera, label: "Temuan" },
// ];

function toUserRoleLabel(role) {
  return String(role || "viewer")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function initialsOf(name) {
  return String(name || "Pengguna")
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US";
}

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}) {
  const auth = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  // const [patrolGroupOpen, setPatrolGroupOpen] = useState(
  //   location.pathname.startsWith("/patrols") ||
  //     location.pathname.startsWith("/incidents") ||
  //     location.pathname.startsWith("/findings"),
  // );
  const isCollapsed = collapsed && !mobileOpen;
  const ssoPortalBaseUrl = String(import.meta.env.VITE_SSO_PORTAL_URL || "/sso").replace(/\/+$/, "");

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      onMobileClose?.();
    }
  }, [location.pathname, onMobileClose]);

  // useEffect(() => {
  //   if (
  //     location.pathname.startsWith("/patrols") ||
  //     location.pathname.startsWith("/incidents") ||
  //     location.pathname.startsWith("/findings")
  //   ) {
  //     setPatrolGroupOpen(true);
  //   }
  // }, [location.pathname]);

  const handleLogout = async () => {
    await auth.logout();
  };

  const userName = auth.user?.fullName || auth.user?.name || auth.user?.email || "Pengguna";
  const userRole = toUserRoleLabel(auth.user?.role);
  const userInitials = initialsOf(userName);

  // const isPathActive = (href) =>
  //   location.pathname === href || (href !== "/" && location.pathname.startsWith(`${href}/`));

  const handleMobileClose = () => {
    onMobileClose?.();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={handleMobileClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar shadow-2xl transition-[width,transform] duration-300 md:static md:z-auto md:shadow-none",
          "w-[82vw] max-w-[320px] md:w-[260px]",
          isCollapsed && "md:w-[72px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        style={{ background: "var(--gradient-sidebar)" }}
      >
        <img
          src={motifSidebar}
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none select-none absolute bottom-0 left-0",
            "opacity-100 w-[10px] md:w-[140px]",
            isCollapsed && "md:w-[140px]",
          )}
        />

        <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
          <div className={cn("flex min-w-0 flex-1 items-center gap-3", isCollapsed && "md:justify-center md:gap-0")}>
            <div
              className={cn(
                "h-12 w-12 rounded-xl bg-white/95 p-1 shadow-sm ring-1 ring-white/25",
                isCollapsed && "md:h-10 md:w-10",
              )}
            >
              <img
                src={logoRajaAmpat}
                alt="Konservasi Raja Ampat"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-bold leading-tight text-white">SIJALA</h1>
                <p className="truncate text-[11px] text-sidebar-foreground/70">Patroli Jaga Laut</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleMobileClose}
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            aria-label="Tutup sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto custom-scrollbar py-4">
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Menu Utama
              </p>
            )}

            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn("nav-item", isActive && "active", isCollapsed && "justify-center px-2")
                }
                title={isCollapsed ? item.label : undefined}
                onClick={handleMobileClose}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}

            {/*
            {isCollapsed ? (
              <NavLink
                to="/patrols"
                className={cn(
                  "nav-item justify-center px-2",
                  (isPathActive("/patrols") || isPathActive("/incidents") || isPathActive("/findings")) &&
                    "active",
                )}
                title="Patroli"
                onClick={handleMobileClose}
              >
                <Route className="h-5 w-5 flex-shrink-0" />
              </NavLink>
            ) : (
              <div className="space-y-1">
                <button
                  type="button"
                  className={cn(
                    "nav-item w-full justify-between",
                    (isPathActive("/patrols") || isPathActive("/incidents") || isPathActive("/findings")) &&
                      "active",
                  )}
                  onClick={() => setPatrolGroupOpen((prev) => !prev)}
                  aria-expanded={patrolGroupOpen}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Route className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Patroli</span>
                  </span>
                  {patrolGroupOpen ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>

                <div className={cn("overflow-hidden transition-all duration-200", patrolGroupOpen ? "max-h-52" : "max-h-0")}>
                  <div className="space-y-1 pt-1">
                    {patrolGroupItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn("nav-item py-2 pl-11 pr-3 text-sm", isActive && "active")
                        }
                        title={item.label}
                        onClick={handleMobileClose}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )}
            */}
          </div>
        </nav>

        <button
          type="button"
          onClick={onToggle}
          className="absolute -right-3 top-24 hidden rounded-full border border-sidebar-border bg-sidebar p-1.5 transition-colors hover:bg-sidebar-accent md:flex"
          aria-label={isCollapsed ? "Perluas menu samping" : "Ciutkan menu samping"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-sidebar-foreground" />
          )}
        </button>

        <div className={cn("border-t border-sidebar-border p-4", isCollapsed && "md:flex md:flex-col md:items-center md:gap-2")}>
          {!isCollapsed && (
            <div className="mb-3 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/30 p-2">
              <p className="text-[10px] uppercase tracking-wider text-white">Bahasa</p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setLanguage("id")}
                  className={cn(
                    "flex items-center justify-center rounded-md px-2 py-1 transition-colors",
                    language === "id"
                      ? "bg-sidebar-primary/20 ring-1 ring-sidebar-primary/40"
                      : "hover:bg-sidebar-accent",
                  )}
                  aria-pressed={language === "id"}
                  aria-label="Bahasa Indonesia"
                >
                  <img src="/flags/id.svg" alt="Bendera Indonesia" className="h-4 w-6 rounded-[2px] object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "flex items-center justify-center rounded-md px-2 py-1 transition-colors",
                    language === "en"
                      ? "bg-sidebar-primary/20 ring-1 ring-sidebar-primary/40"
                      : "hover:bg-sidebar-accent",
                  )}
                  aria-pressed={language === "en"}
                  aria-label="Bahasa Inggris"
                >
                  <img src="/flags/gb.svg" alt="Bendera Inggris" className="h-4 w-6 rounded-[2px] object-cover" />
                </button>
              </div>
              <a
                href={`${ssoPortalBaseUrl}/#/profile`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Buka Portal SSO</span>
              </a>
            </div>
          )}

          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-sidebar-accent"
                onClick={handleMobileClose}
                title="Profil"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20">
                  <span className="text-sm font-semibold text-sidebar-primary">{userInitials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
                  <p className="text-[10px] text-sidebar-foreground/60">{userRole}</p>
                </div>
              </NavLink>
              <button
                type="button"
                className="rounded-lg p-1.5 transition-colors hover:bg-sidebar-accent"
                onClick={handleLogout}
                title="Keluar"
              >
                <LogOut className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/profile"
                className="flex items-center justify-center rounded-lg p-2 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                onClick={handleMobileClose}
                title="Profil"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">
                  {userInitials}
                </div>
              </NavLink>
              <button
                type="button"
                className="rounded-lg p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                onClick={handleLogout}
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
