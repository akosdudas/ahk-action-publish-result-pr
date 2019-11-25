import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";

async function run() {
  try {
    const token = core.getInput("github-token", { required: true });

    const { pull_request: pr } = github.context.payload;
    if (!pr) {
      throw new Error(
        "This action must be triggered on a pull request. (Event payload missing `pull_request`)"
      );
    }

    if (!fs.existsSync("neptun.txt")) {
      throw new Error(
        "Hiba: neptun.txt nem talalhato. Error: neptun.txt does not exist"
      );
    }

    const neptunLines = fs
      .readFileSync("neptun.txt", "utf-8")
      .split("\n")
      .filter(Boolean);
    if (neptunLines.length == 0) {
      throw new Error("Hiba: neptun.txt ures. Error: neptun.txt is empty");
    }

    const neptun = neptunLines[0].trim();
    if (neptun.length == 0) {
      throw new Error("Hiba: neptun.txt ures. Error: neptun.txt is empty");
    }

    const client = new github.GitHub(token);
    core.debug(`Pull request ID is #${pr.number}`);

    await client.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: pr.number,
      body: "Hello from GH action\r\n\r\nNepun: " + neptun
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
