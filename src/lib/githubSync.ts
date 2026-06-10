import { Octokit } from "@octokit/rest";
import { supabaseAdmin } from "../supabase/config";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const ORG_NAME = process.env.GITHUB_ORG_NAME || "hut-8-future-ai";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "hut-8-future-ai-";
const REPO_FULL_NAME = `${ORG_NAME}/${REPO_NAME}`;

/**
 * Fetch organization members and add them to Supabase
 */
export async function syncOrgMembers() {
  try {
    console.log(`Fetching members from organization: ${ORG_NAME}`);

    const { data: members } = await octokit.orgs.listMembers({
      org: ORG_NAME,
      per_page: 100,
    });

    console.log(`Found ${members.length} organization members`);

    for (const member of members) {
      try {
        // Get full user details
        const { data: userDetails } = await octokit.users.getByUsername({
          username: member.login,
        });

        const userData = {
          github_id: userDetails.id,
          username: userDetails.login,
          name: userDetails.name,
          avatar_url: userDetails.avatar_url,
          bio: userDetails.bio,
          company: userDetails.company,
          location: userDetails.location,
          email: userDetails.email,
          blog_url: userDetails.blog,
          twitter_username: userDetails.twitter_username,
          public_repos: userDetails.public_repos,
          public_gists: userDetails.public_gists,
          followers: userDetails.followers,
          following: userDetails.following,
          user_type: userDetails.type,
          is_org_member: true,
          org_name: ORG_NAME,
        };

        const { error } = await supabaseAdmin
          .from("users_tracked")
          .upsert(userData, {
            onConflict: "github_id",
          });

        if (error) {
          console.error(`Error syncing member ${member.login}:`, error);
        } else {
          console.log(`✅ Synced member: ${member.login}`);
        }
      } catch (err) {
        console.error(`Error fetching details for ${member.login}:`, err);
      }
    }

    console.log("✅ Organization members sync complete!");
  } catch (error) {
    console.error("Error syncing organization members:", error);
    throw error;
  }
}

/**
 * Fetch repository contributors and add them to Supabase
 */
export async function syncRepoContributors() {
  try {
    console.log(`Fetching contributors from repository: ${REPO_FULL_NAME}`);

    const { data: contributors } = await octokit.repos.listContributors({
      owner: ORG_NAME,
      repo: REPO_NAME,
      per_page: 100,
    });

    console.log(`Found ${contributors.length} contributors`);

    for (const contributor of contributors) {
      try {
        // Get full user details
        const { data: userDetails } = await octokit.users.getByUsername({
          username: contributor.login,
        });

        const userData = {
          github_id: userDetails.id,
          username: userDetails.login,
          name: userDetails.name,
          avatar_url: userDetails.avatar_url,
          bio: userDetails.bio,
          company: userDetails.company,
          location: userDetails.location,
          email: userDetails.email,
          blog_url: userDetails.blog,
          twitter_username: userDetails.twitter_username,
          public_repos: userDetails.public_repos,
          public_gists: userDetails.public_gists,
          followers: userDetails.followers,
          following: userDetails.following,
          user_type: userDetails.type,
          is_repo_contributor: true,
          repo_name: REPO_NAME,
        };

        const { error } = await supabaseAdmin
          .from("users_tracked")
          .upsert(userData, {
            onConflict: "github_id",
          });

        if (error) {
          console.error(
            `Error syncing contributor ${contributor.login}:`,
            error
          );
        } else {
          console.log(`✅ Synced contributor: ${contributor.login}`);
        }
      } catch (err) {
        console.error(`Error fetching details for ${contributor.login}:`, err);
      }
    }

    console.log("✅ Repository contributors sync complete!");
  } catch (error) {
    console.error("Error syncing repository contributors:", error);
    throw error;
  }
}

/**
 * Main sync function - runs both org and repo syncs
 */
export async function syncAllUsers() {
  try {
    console.log("Starting user sync...");
    await syncOrgMembers();
    await syncRepoContributors();
    console.log("✅ All users synced successfully!");
  } catch (error) {
    console.error("Error during user sync:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncAllUsers();
}
