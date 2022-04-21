import { Octokit, App } from "octokit";
import { Repository } from "./interfaces/repository";
import { Ui5Version } from "./interfaces/ui5versions";
import dotenv from "dotenv";
import { Endpoints, OctokitResponse } from "@octokit/types";
import axios from "axios";
import * as fs from "fs";
dotenv.config();

const octokit = new Octokit({
  auth: process.env.KEY,
});

async function getUi5Versions(): Promise<{ data: Ui5Version; status: number }> {
  const { data, status } = await axios.get<Ui5Version>(
    "https://sapui5.hana.ondemand.com/versionoverview.json",
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (status === 200) {
    return { data, status };
  } else {
    return { data, status };
  }
}

async function getContent(
  path: string,
  owner: string,
  repo: { name: string; url: string },
  ui5Versions: any
): Promise<{
  success: boolean;
  repo: { name: string; url: string };
  sapVersion: string;
  sapEocp: string;
}> {
  const patches = ui5Versions.data.patches;
  const versions = ui5Versions.data.versions;
  let data = null;
  try {
    const response = await octokit.rest.repos.getContent({
      mediaType: {
        format: "raw",
      },
      owner: owner,
      repo: repo.name,
      path: path,
    });

    data = response.data;
  } catch (error) {
    // console.log("ERROR");
  }

  if (!data) {
    return { success: false, repo, sapVersion: "", sapEocp: "" };
  }

  let text: any = data;
  let n = text.match(/https:\/\/sapui5.hana.ondemand.com\/(.*)\/resources\//i);
  let sapVersion: string = "";
  let sapEocp: string = "";
  if (n && n.length > 1 && n[1]) {
    sapVersion = n[1];
    sapEocp = patches.filter((version: any) => {
      return version.version === sapVersion;
    })[0].eocp;
  }

  if (sapVersion === "") {
    sapVersion = "latest or local hosted";
  }

  return { success: true, repo, sapVersion, sapEocp };
}

async function getTeam(team: string) {
  const t = await octokit.rest.teams.getByName({
    org: "Alliander",
    team_slug: team,
  });
}

async function getTeamRepos(team: string): Promise<any> {
  const repositories: OctokitResponse<
    Endpoints["GET /orgs/{org}/teams/{team_slug}/repos"]["response"]["data"]
  > = await octokit.request("GET /orgs/{org}/teams/{team_slug}/repos", {
    org: "Alliander",
    team_slug: team,
  });

  return repositories;
}

async function handleResponse(repos: Repository[], ui5Versions: any) {
  for (const repo of repos) {
    const { name, html_url } = repo;
    await getContent("web/webapp/index.html", "Alliander", repo, ui5Versions);
  }
}

async function handleResponseAll(repos: any, ui5Versions: any) {
  for (const repo of repos) {
    const { name, html_url } = repo;
    await getContent("web/webapp/index.html", "Alliander", repo, ui5Versions);
  }
}

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function searchCode() {
  const latestVersionBootstrap = "com/resources/sap-ui-core.js";
  const versionedBootstrap = "**/resources/sap-ui-core.js";
  const results: any = await octokit.paginate("GET /search/code", {
    q: "org:Alliander sap-ui-core in:file language:html",
    per_page: 100,
  });

  return results;
}

async function getRepos() {
  const repositories: any = await octokit.paginate("GET /orgs/{org}/repos", {
    org: "Alliander",
    per_page: 100,
  });

  return repositories;
}

async function getTeams() {
  const teams: OctokitResponse<
    Endpoints["GET /orgs/{org}/teams"]["response"]["data"]
  > = await octokit.request("GET /orgs/{org}/teams", {
    org: "Alliander",
  });

  return teams;
}

async function writeFile(
  file: string,
  content: any,
  json = true
): Promise<void> {
  fs.writeFile(file, JSON.stringify(content), (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

(async () => {
  // const results = [];
  // // const results = await searchCode();
  // const ui5Versions = await getUi5Versions();
  // const searchResults = require("./output.json");
  // console.log(searchResults.length);
  // let count = 1;
  // for (const result of searchResults) {
  //   console.log(count);
  //   count++;
  //   const repo = {
  //     name: result.repository.name,
  //     url: result.repository.html_url,
  //   };

  //   const search = {
  //     file: result.name,
  //     path: result.path,
  //   };

  //   if (search.path.includes("index.html")) {
  //     const content = await getContent(
  //       search.path,
  //       "Alliander",
  //       repo,
  //       ui5Versions
  //     );

  //     results.push(content);
  //     await timer(1000);
  //   }
  // }
  // console.log("DONE");
  // writeFile("EOCPAllianderScan.json", results);

  const r = require("./files/EOCPAllianderScan.json");
  const filtered = r.filter((e: any) => e.sapEocp !== "");
  writeFile("./files/EOCPAllianderScanAttention.json", filtered);
})();
