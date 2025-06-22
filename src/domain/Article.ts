export class Article {
  id: string;
  title: string;
  url: string;
  created_at: Date;

  constructor(id: string, title: string, url: string, created_at: Date) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.created_at = created_at;
  }
}
