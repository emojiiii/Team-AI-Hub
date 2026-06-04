use skill_library_core::WorkspaceRef;
use skill_library_provider::{
    ChangedFile, Member, Page, PageOpts, PullRequestQueryState, PullRequestSummary,
    RepositoryEvent, Result,
};

use crate::models::{
    CollaboratorResponse, PullRequestFileResponse, PullRequestResponse, RepositoryEventResponse,
};
use crate::provider::GiteeProvider;
use crate::util::url_encode;

impl GiteeProvider {
    pub async fn list_pull_requests(
        &self,
        reference: &WorkspaceRef,
        state: PullRequestQueryState,
    ) -> Result<Vec<PullRequestSummary>> {
        let (owner, repo) = Self::owner_repo(reference);
        let state = match state {
            PullRequestQueryState::Open => "open",
            PullRequestQueryState::Closed => "closed",
            PullRequestQueryState::All => "all",
        };
        let raw: Vec<PullRequestResponse> = self
            .get_json(&format!(
                "/repos/{owner}/{repo}/pulls?state={state}&sort=updated&direction=desc&per_page=50"
            ))
            .await?;
        Ok(raw.into_iter().map(PullRequestSummary::from).collect())
    }

    pub async fn list_pull_request_files(
        &self,
        reference: &WorkspaceRef,
        number: u64,
    ) -> Result<Vec<ChangedFile>> {
        let (owner, repo) = Self::owner_repo(reference);
        let raw: Vec<PullRequestFileResponse> = self
            .get_json(&format!("/repos/{owner}/{repo}/pulls/{number}/files"))
            .await?;
        Ok(raw.into_iter().map(ChangedFile::from).collect())
    }

    pub async fn list_repository_events(
        &self,
        reference: &WorkspaceRef,
    ) -> Result<Vec<RepositoryEvent>> {
        let (owner, repo) = Self::owner_repo(reference);
        let raw: Vec<RepositoryEventResponse> = self
            .get_json(&format!("/repos/{owner}/{repo}/events?per_page=30"))
            .await?;
        Ok(raw.into_iter().map(RepositoryEvent::from).collect())
    }

    pub async fn list_collaborators(
        &self,
        reference: &WorkspaceRef,
        opts: PageOpts,
    ) -> Result<Page<Member>> {
        let (owner, repo) = Self::owner_repo(reference);
        let per_page = opts.per_page.unwrap_or(100);
        let page = opts.cursor.unwrap_or_else(|| "1".to_owned());
        let raw: Page<CollaboratorResponse> = self
            .get_page_json(&format!(
                "/repos/{owner}/{repo}/collaborators?per_page={per_page}&page={}",
                url_encode(&page)
            ))
            .await?;
        Ok(Page {
            items: raw.items.into_iter().map(Member::from).collect(),
            next_cursor: raw.next_cursor,
        })
    }
}
