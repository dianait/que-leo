import { Article } from '../domain/Article';

export const mockArticles: Article[] = [
  new Article('1', 'Artículo 1', 'https://ejemplo.com/1', new Date('2024-01-01')),
  new Article('2', 'Artículo 2', 'https://ejemplo.com/2', new Date('2024-02-01')),
  new Article('3', 'Artículo 3', 'https://ejemplo.com/3', new Date('2024-03-01')),
  new Article('4', 'Artículo 4', 'https://ejemplo.com/4', new Date('2024-04-01')),
];

export class GetRandomArticile {
  execute(): Article {
    const randomIndex = Math.floor(Math.random() * mockArticles.length);
    return mockArticles[randomIndex];
  }
}
