export class Article {
  readonly id: number | string;
  readonly title: string;
  readonly url: string;
  readonly dateAdded: Date;
  readonly isRead: boolean;
  readonly readAt?: Date;

  constructor(
    id: number | string,
    title: string,
    url: string,
    dateAdded: Date,
    isRead: boolean = false,
    readAt?: Date
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.dateAdded = dateAdded;
    this.isRead = isRead;
    this.readAt = readAt;
  }

  markAsRead(): Article {
    return new Article(
      this.id,
      this.title,
      this.url,
      this.dateAdded,
      true,
      new Date()
    );
  }

  markAsUnread(): Article {
    return new Article(
      this.id,
      this.title,
      this.url,
      this.dateAdded,
      false,
      undefined
    );
  }
}
