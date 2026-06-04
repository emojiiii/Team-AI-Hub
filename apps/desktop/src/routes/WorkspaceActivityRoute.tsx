import { useWorkspace } from "../context/WorkspaceContext";
import { providerSupportsActivityPage, workspaceProviderLabel } from "../lib/providers";
import { ActivityPage } from "../pages/ActivityPage";

export function WorkspaceActivityRoute() {
  const { workspace, providerId, providerInstance } = useWorkspace();
  return (
    <ActivityPage
      workspaceRef={workspace}
      providerName={providerInstance?.displayName || workspaceProviderLabel(providerId)}
      supportsActivity={providerSupportsActivityPage(providerInstance ?? undefined, providerId)}
    />
  );
}
