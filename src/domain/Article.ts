export class Article {
  id: string;
  title: string;
  url: string;
  dateAdded: Date;

  constructor(id: string, title: string, url: string, dateAdded: Date) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.dateAdded = dateAdded;
  }
}
