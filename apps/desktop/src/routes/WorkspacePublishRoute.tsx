import { useWorkspace } from "../context/WorkspaceContext";
import {
  providerSupportsPullRequestActions,
  providerSupportsPullRequestPage,
  workspaceProviderLabel,
} from "../lib/providers";
import { PublishPage } from "../pages/PublishPage";

export function WorkspacePublishRoute() {
  const { workspace, providerId, providerInstance } = useWorkspace();
  return (
    <PublishPage
      workspaceRef={workspace}
      providerName={providerInstance?.displayName || workspaceProviderLabel(providerId)}
      supportsPullRequests={providerSupportsPullRequestPage(providerInstance ?? undefined, providerId)}
      supportsPullRequestActions={providerSupportsPullRequestActions(providerInstance ?? undefined, providerId)}
    />
  );
}
