"use client";

import {
  Home,
  Search,
  Library,
  Layers,
  NotebookPen,
  Compass,
  LogOut,
  UserRound,
} from "lucide-react";
import type { AppScreen } from "@/lib/app-routes";

type HeaderProps = {
  hidden?: boolean;
  activeScreen: AppScreen;
  avatarUrl?: string;
  onProfile: () => void;
  onSignOut: () => void;
};

export function AppHeader({
  hidden,
  activeScreen,
  avatarUrl,
  onProfile,
  onSignOut,
}: HeaderProps) {
  if (hidden) return null;
  return (
    <div className="row app-header logo-free-header">
      <button
        className={
          "header-account " + (activeScreen === "account" ? "active" : "")
        }
        aria-label="Account settings"
        onClick={onProfile}
      >
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <UserRound size={20} />}
      </button>
      <button className="nav" aria-label="Sign out" onClick={onSignOut}>
        <LogOut size={20} />
      </button>
    </div>
  );
}

type BottomNavigationProps = {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
};

const items = [
  ["home", Home, "Home"],
  ["shelf", Library, "Shelf"],
  ["find", Search, "Find"],
  ["build", Layers, "Build"],
  ["journal", NotebookPen, "Journal"],
  ["explore", Compass, "Explore"],
] as const;

export function BottomNavigation({
  activeScreen,
  onNavigate,
}: BottomNavigationProps) {
  return (
    <nav className="bottom" aria-label="Main navigation">
      {items.map(([screen, Icon, label]) => (
        <button
          key={screen}
          className={
            "nav " +
            (activeScreen === screen ||
            (activeScreen === "studio" && screen === "shelf")
              ? "active"
              : "")
          }
          aria-current={
            activeScreen === screen ||
            (activeScreen === "studio" && screen === "shelf")
              ? "page"
              : undefined
          }
          onClick={() => onNavigate(screen)}
        >
          <Icon size={19} />
          <br />
          {label}
        </button>
      ))}
    </nav>
  );
}
