export type AppPage =
  | "discover"
  | "mySkills"
  | "workspaces"
  | "publish"
  | "invitations"
  | "subscriptions"
  | "activity"
  | "cli";

/** Consumer-layer pages: always visible, fully anonymous. */
export const consumerPages: AppPage[] = ["discover", "mySkills"];

/** Creator-layer pages: only shown once the user signs in with GitHub. */
export const creatorPages: AppPage[] = [
  "workspaces",
  "publish",
  "invitations",
  "activity",
  "subscriptions",
  "cli",
];

/** Pages that need a selected workspace (rendered under the WorkspaceShell layout) */
export const workspaceScopedPages: AppPage[] = ["workspaces", "publish", "invitations", "activity"];

/** Pages that are top-level (personal, not workspace-scoped) */
export const personalPages: AppPage[] = ["discover", "mySkills", "subscriptions", "cli"];

/** i18n keys for page title/subtitle — resolve via t() at render time */
export const pageCopyKeys: Record<AppPage, { titleKey: string; subtitleKey: string }> = {
  discover: { titleKey: "page.discover.title", subtitleKey: "page.discover.subtitle" },
  mySkills: { titleKey: "page.mySkills.title", subtitleKey: "page.mySkills.subtitle" },
  workspaces: { titleKey: "page.skills.title", subtitleKey: "page.skills.subtitle" },
  publish: { titleKey: "page.publish.title", subtitleKey: "page.publish.subtitle" },
  invitations: { titleKey: "page.members.title", subtitleKey: "page.members.subtitle" },
  subscriptions: { titleKey: "page.subscriptions.title", subtitleKey: "page.subscriptions.subtitle" },
  activity: { titleKey: "page.activity.title", subtitleKey: "page.activity.subtitle" },
  cli: { titleKey: "page.cli.title", subtitleKey: "page.cli.subtitle" },
};

/**
 * Static path for each workspace-scoped page. Since this is a desktop app the
 * workspace identity lives in global state (appStore.selectedWorkspace), NOT in
 * the URL — so these are flat top-level paths.
 */
export const workspacePagePath: Record<string, AppPage> = {
  "/skills": "workspaces",
  "/publish": "publish",
  "/members": "invitations",
  "/activity": "activity",
};

export interface NavRoute {
  page: AppPage;
  /** Whether this page needs a selected workspace (vs. a personal page). */
  scope: "workspace" | "personal";
  /** Static route path. */
  path: string;
}

export const navRoutes: NavRoute[] = [
  { page: "discover", scope: "personal", path: "/discover" },
  { page: "mySkills", scope: "personal", path: "/my-skills" },
  { page: "workspaces", scope: "workspace", path: "/skills" },
  { page: "publish", scope: "workspace", path: "/publish" },
  { page: "invitations", scope: "workspace", path: "/members" },
  { page: "activity", scope: "workspace", path: "/activity" },
  { page: "subscriptions", scope: "personal", path: "/subscriptions" },
  { page: "cli", scope: "personal", path: "/cli" },
];

/** Build the path for a nav route. All routes are now static. */
export function buildNavPath(route: NavRoute): string {
  return route.path;
}

export function routeToPage(pathname: string): AppPage {
  if (pathname.startsWith("/discover")) return "discover";
  if (pathname.startsWith("/my-skills")) return "mySkills";
  if (pathname.startsWith("/subscriptions")) return "subscriptions";
  if (pathname.startsWith("/cli")) return "cli";
  if (pathname.startsWith("/skills")) return "workspaces";
  if (pathname.startsWith("/publish")) return "publish";
  if (pathname.startsWith("/members")) return "invitations";
  if (pathname.startsWith("/activity")) return "activity";
  return "discover";
}

export const inviteRoles = ["read", "triage", "write", "maintain", "admin"] as const;
export type InviteRole = (typeof inviteRoles)[number];

export const inviteRoleLabel: Record<InviteRole, string> = {
  read: "Read",
  triage: "Triage",
  write: "Write",
  maintain: "Maintain",
  admin: "Admin",
};
