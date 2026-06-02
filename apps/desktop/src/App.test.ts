import { describe, expect, it } from "vitest";
import { navRoutes, pageCopyKeys, routeToPage } from "./utils/navigation";
import { formatError } from "./utils/format";

describe("desktop routed management pages", () => {
  it("maps routed URLs to the correct workbench page", () => {
    expect(routeToPage("/")).toBe("discover");
    expect(routeToPage("/skills")).toBe("workspaces");
    expect(routeToPage("/publish")).toBe("publish");
    expect(routeToPage("/members")).toBe("invitations");
    expect(routeToPage("/activity")).toBe("activity");
    expect(routeToPage("/discover")).toBe("discover");
    expect(routeToPage("/my-skills")).toBe("mySkills");
    expect(routeToPage("/subscriptions")).toBe("subscriptions");
    expect(routeToPage("/cli")).toBe("cli");
  });

  it("keeps the sidebar route contract aligned with page copy keys", () => {
    for (const route of navRoutes) {
      expect(pageCopyKeys[route.page].titleKey).toBeTruthy();
      expect(pageCopyKeys[route.page].subtitleKey).toBeTruthy();
    }
    expect(pageCopyKeys.invitations.subtitleKey).toBe("page.members.subtitle");
  });

  it("navRoutes covers all workspace-scoped and personal pages", () => {
    const pages = navRoutes.map((r) => r.page);
    expect(pages).toContain("workspaces");
    expect(pages).toContain("publish");
    expect(pages).toContain("invitations");
    expect(pages).toContain("activity");
    expect(pages).toContain("subscriptions");
    expect(pages).toContain("mySkills");
    expect(pages).toContain("cli");
  });

  it("formats structured command and API errors", () => {
    expect(formatError({ code: "missing_github_token", message: "GitHub token is required" })).toBe(
      "missing_github_token: GitHub token is required",
    );
    expect(
      formatError({
        ok: false,
        error: { code: "invalid_request", message: "The request body is invalid." },
      }),
    ).toBe("invalid_request: The request body is invalid.");
    expect(formatError(new Error("network unavailable"))).toBe("network unavailable");
  });
});
