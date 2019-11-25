import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("github-token", { required: true });

    const { pull_request: pr } = github.context.payload;
    if (!pr) {
      throw new Error(
        "This action must be triggered on a pull request. (Event payload missing `pull_request`)"
      );
    }

    const client = new github.GitHub(token);
    core.debug(`Pull request ID is #${pr.number}`);

    await client.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: pr.number,
      body: "Hello from GH action"
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
