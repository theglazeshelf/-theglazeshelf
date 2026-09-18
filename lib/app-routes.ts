export type AppScreen =
  | "home"
  | "shelf"
  | "studio"
  | "find"
  | "build"
  | "journal"
  | "explore"
  | "account";

const screenPaths: Record<AppScreen, string> = {
  home: "/",
  shelf: "/shelf",
  studio: "/shelf/studio",
  find: "/find",
  build: "/build",
  journal: "/journal",
  explore: "/explore",
  account: "/profile",
};

export function pathForScreen(screen: AppScreen) {
  return screenPaths[screen];
}

export function screenForPath(pathname: string): AppScreen {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const match = (Object.entries(screenPaths) as [AppScreen, string][]).find(
    ([, path]) => path === cleanPath,
  );
  return match?.[0] || "home";
}
