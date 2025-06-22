export class Article {
  constructor(
    public readonly id: number | string,
    public readonly title: string,
    public readonly url: string,
    public readonly dateAdded: Date,
    public readonly isRead: boolean = false,
    public readonly readAt?: Date
  ) {}

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
