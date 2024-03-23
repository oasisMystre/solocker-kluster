import Repository from "./repository";

export default class InjectRepository {
  constructor(readonly repository: Repository) {}
}
