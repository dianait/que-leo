import { GetRandomArticle } from "../src/application/GetRandomArticle";
import { Article } from "../src/domain/Article";
import { ArticleRepository } from "../src/domain/ArticleRepository";
import { JsonArticleRepository } from "../src/infrastructure/repositories/JSONArticleRepository";

test("getRandomArticle devuelve un artículo aleatorio", async () => {
  // Mock repository con datos conocidos
  const mockArticles = [
    new Article("1", "Artículo 1", "http://ejemplo1.com", new Date()),
    new Article("2", "Artículo 2", "http://ejemplo2.com", new Date()),
    new Article("3", "Artículo 3", "http://ejemplo3.com", new Date()),
  ];

  const mockRepo = {
    getAllArticles: jest.fn().mockResolvedValue(mockArticles),
  };

  const useCase = new GetRandomArticle(mockRepo as ArticleRepository);
  const article = await useCase.execute();

  expect(mockArticles).toContain(article);
  expect(mockRepo.getAllArticles).toHaveBeenCalledTimes(1);
});

test("getRandomArticle devuelve un artículo válido del JSON", async () => {
  const repo = new JsonArticleRepository();
  const useCase = new GetRandomArticle(repo);

  const article = await useCase.execute();

  expect(article).toHaveProperty("id");
  expect(article).toHaveProperty("title");
  expect(article).toHaveProperty("url");
  expect(article.dateAdded).toBeInstanceOf(Date);
});
