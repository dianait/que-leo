import { Article } from "../domain/Article";
import { JsonArticleRepository } from "../infrastructure/repositories/JSONArticleRepository";

export class GetAllArticles {
  private repository: JsonArticleRepository;

  constructor(repository: JsonArticleRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Article[]> {
    return await this.repository.getAllArticles();
  }
}
