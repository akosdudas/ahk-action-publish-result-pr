import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";

async function run() {
  try {
    const token = core.getInput("github-token", { required: true });
    const input_file = core.getInput("input-file", { required: true });

    const { pull_request: pr } = github.context.payload;
    if (!pr) {
      throw new Error(
        "This action must be triggered on a pull request. (Event payload missing `pull_request`)"
      );
    }
    core.debug(`Pull request ID is #${pr.number}`);

    const neptun = getNeptunCode();
    const taskResults = processResultFile(input_file);

    // console.debug(formatMessage(neptun, taskResults));

    const client = new github.GitHub(token);
    await client.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: pr.number,
      body: formatMessage(neptun, taskResults)
    });
  } catch (error) {
    core.setFailed(error.message);
  }

  interface AhkTaskResult {
    taskName: string;
    result: string;
    comments: string;
  }

  function formatMessage(neptun: string, taskResults: AhkTaskResult[]): string {
    var str = "";
    str += "**Neptun: " + neptun + "**";
    str += "\\r\\n";
    str += "\\r\\n";
    for (const r of taskResults) {
      str += "**" + r.taskName + "**: " + r.result + "\\r\\n";
      if (r.comments && r.comments.length > 0) {
        str += r.comments;
      }
      str += "\\r\\n";
    }
    return str;
  }

  function processResultFile(file: string): AhkTaskResult[] {
    if (!fs.existsSync(file)) {
      throw new Error(
        "Hiba: eredmeny fajl nem talalhato. Error: result file not found."
      );
    }

    var lines = fs
      .readFileSync(file, "utf-8")
      .split("\n")
      .filter(Boolean);

    var results = Array<AhkTaskResult>();
    var lineIdx = 0;
    while (true) {
      if (lineIdx >= lines.length) {
        break;
      }

      const line = lines[lineIdx];
      ++lineIdx;
      core.debug(`Line from file: ${line}`);

      if (line.startsWith("###ahk#")) {
        var entry = line.trimRight();
        while (entry.endsWith("\\")) {
          entry = entry.substring(0, entry.length - 1).trimRight();

          if (lineIdx < lines.length) {
            const nextLine = lines[lineIdx];
            ++lineIdx;
            core.debug(`Multiline continuation: ${nextLine}`);

            entry = entry + "\\r\\n" + nextLine.trimRight();
          }
        }

        const items = entry.split("#").filter(x => x);
        if (items.length < 3) {
          core.warning(`Invalid line: ${line}`);
        } else {
          results.push({
            taskName: items[1],
            result: items[2],
            comments: items.length > 3 ? items[3] : ""
          });
        }
      }
    }

    return results;
  }

  function getNeptunCode(): string {
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

    return neptun;
  }
}

run();
