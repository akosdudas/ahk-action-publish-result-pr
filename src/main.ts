import * as core from "@actions/core";
import * as github from "@actions/github";
import * as fs from "fs";

// This is the entry point
async function run() {
  const markdown_newline = "\n";

  try {
    const token = core.getInput("github-token", { required: true });
    const input_file = core.getInput("input-file", { required: true });

    const { pull_request: pr } = github.context.payload;
    if (!pr) {
      throw new Error("This action must be triggered on a pull request.");
    }

    core.info(
      `Running in repo ${github.context.repo.owner}/${github.context.repo.repo}`
    );
    core.info(`Pull request ID is #${pr.number}`);

    const neptun = getNeptunCode();
    const taskResults = processResultFile(input_file);

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
    exerciseName: string;
    taskName: string;
    points: number;
    comments: string;
  }

  function formatMessage(neptun: string, taskResults: AhkTaskResult[]): string {
    var str = "";
    str += "**Neptun**: " + neptun;
    str += markdown_newline;
    str += markdown_newline;
    for (const r of taskResults) {
      str += "**" + formatTaskName(r) + "**: ";
      str += isNaN(r.points) ? "N/A" : r.points.toString();
      str += markdown_newline;
      if (r.comments && r.comments.length > 0) {
        str += r.comments;
      }
      str += markdown_newline + markdown_newline;
    }

    str += "**Osszesen / Total**:";
    str += markdown_newline;

    const groupByExercise = groupBy(taskResults, obj => obj.exerciseName);
    for (const ex in groupByExercise) {
      if (ex.length > 0) {
        str += ex + ": ";
      }

      const tasksOfEx = groupByExercise[ex];
      if (taskResults.filter(x => isNaN(x.points)).length > 0) {
        str += "inconclusive";
      } else {
        const sum = tasksOfEx.reduce((a, b) => a + (b.points || 0), 0);
        str += sum.toString();
      }
      str += markdown_newline;
    }

    return str;
  }

  function groupBy<T extends any, K extends keyof T>(
    array: T[],
    key: K | { (obj: T): string }
  ): Record<string, T[]> {
    const keyFn = key instanceof Function ? key : (obj: T) => obj[key];
    return array.reduce((objectsByKeyValue, obj) => {
      const value = keyFn(obj);
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {} as Record<string, T[]>);
  }

  function formatTaskName(r: AhkTaskResult): string {
    var { taskName } = r;
    if (!taskName || taskName.length == 0) {
      taskName = "N/A";
    }

    if (r.exerciseName && r.exerciseName.length > 0) {
      return `${r.exerciseName} / ${taskName}`;
    } else {
      return taskName;
    }
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

            entry = entry + markdown_newline + nextLine.trimRight();
          }
        }

        // ###ahk#taskname#result#comment
        const items = entry.split("#").filter(x => x);
        if (items.length < 3) {
          core.warning(`Invalid line: ${line}`);
        } else {
          results.push({
            exerciseName: getExerciseName(items[1]),
            taskName: getTaskName(items[1]),
            points: getPoints(items[2]),
            comments: items.length > 3 ? items.slice(3).join(" ") : ""
          });
        }
      }
    }

    return results;
  }

  // Gets task from exercise@task
  function getTaskName(name: string): string {
    if (!name || name.length == 0) return "";

    const idx = name.indexOf("@");
    if (idx > -1) {
      return name.substring(idx + 1);
    } else {
      return name;
    }
  }

  // Gets exercise from exercise@task
  function getExerciseName(name: string): string {
    if (!name || name.length == 0) return "";

    const idx = name.indexOf("@");
    if (idx > -1) {
      return name.substring(0, idx);
    } else {
      return "";
    }
  }

  function getPoints(str: string): number {
    if (!str || str.length == 0) return NaN;
    return Number(str);
  }

  // Yields the neptun code from the first line of the neptun.txt file
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

    const regex = /^[a-zA-Z0-9]{6}$/g;
    if (!regex.test(neptun)) {
      throw new Error(
        "Hiba: neptun.txt ervenytelen neptun kodot tartalmaz. Error: neptun.txt contains an invalid neptun code"
      );
    }

    return neptun.toUpperCase();
  }
}

run();
