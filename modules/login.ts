import { Octokit, App } from "octokit";

export class OctokitService {
  octokit: any = null;
  constructor(private key: string) {
    this.octokit = new Octokit({
      auth: key,
    });
  }
}
