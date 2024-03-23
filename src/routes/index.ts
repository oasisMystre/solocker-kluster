import Repository from "../lib/repository";

export class BaseRoute {
  constructor(public readonly repository: Repository) {}
}
