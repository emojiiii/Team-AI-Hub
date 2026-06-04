use skill_library_core::WorkspaceRef;
use skill_library_provider::{
    ChangedFile, Member, Page, PageOpts, PullRequestQueryState, PullRequestSummary,
    RepositoryEvent, Result,
};

use crate::models::{MergeRequestChangesResponse, MergeRequestResponse, ProjectEventResponse};
use crate::provider::GitLabProvider;
use crate::util::url_encode;

impl GitLabProvider {
    pub async fn list_merge_requests(
        &self,
        reference: &WorkspaceRef,
        state: PullRequestQueryState,
    ) -> Result<Vec<PullRequestSummary>> {
        let project = Self::project_id(reference);
        let state = match state {
            PullRequestQueryState::Open => "opened",
            PullRequestQueryState::Closed => "closed",
            PullRequestQueryState::All => "all",
        };
        let raw: Vec<MergeRequestResponse> = self
            .get_json(&format!(
                "/projects/{project}/merge_requests?state={state}&scope=all&order_by=updated_at&sort=desc&per_page=50"
            ))
            .await?;
        Ok(raw.into_iter().map(PullRequestSummary::from).collect())
    }

    pub async fn list_merge_request_files(
        &self,
        reference: &WorkspaceRef,
        number: u64,
    ) -> Result<Vec<ChangedFile>> {
        let project = Self::project_id(reference);
        let raw: MergeRequestChangesResponse = self
            .get_json(&format!(
                "/projects/{project}/merge_requests/{number}/changes"
            ))
            .await?;
        Ok(raw.changes.into_iter().map(ChangedFile::from).collect())
    }

    pub async fn list_repository_events(
        &self,
        reference: &WorkspaceRef,
    ) -> Result<Vec<RepositoryEvent>> {
        let project = Self::project_id(reference);
        let raw: Vec<ProjectEventResponse> = self
            .get_json(&format!("/projects/{project}/events?per_page=30"))
            .await?;
        Ok(raw.into_iter().map(RepositoryEvent::from).collect())
    }

    pub async fn list_project_members(
        &self,
        reference: &WorkspaceRef,
        opts: PageOpts,
    ) -> Result<Page<Member>> {
        let project = Self::project_id(reference);
        let per_page = opts.per_page.unwrap_or(100);
        let page = opts.cursor.unwrap_or_else(|| "1".to_owned());
        let raw: Page<crate::models::MemberResponse> = self
            .get_page_json(&format!(
                "/projects/{project}/members/all?per_page={per_page}&page={}",
                url_encode(&page)
            ))
            .await?;
        Ok(Page {
            items: raw.items.into_iter().map(Member::from).collect(),
            next_cursor: raw.next_cursor,
        })
    }
}
