// Tests for read-state filtering logic

type TestArticle = {
  id: number;
  title: string;
  url: string;
  isRead: boolean;
  dateAdded: Date;
};

const articles: TestArticle[] = [
  {
    id: 1,
    title: "Aprender React",
    url: "u1",
    isRead: false,
    dateAdded: new Date(),
  },
  {
    id: 2,
    title: "Patrones de Diseño",
    url: "u2",
    isRead: true,
    dateAdded: new Date(),
  },
  {
    id: 3,
    title: "TypeScript Tips",
    url: "u3",
    isRead: false,
    dateAdded: new Date(),
  },
  {
    id: 4,
    title: "Accesibilidad Web",
    url: "u4",
    isRead: true,
    dateAdded: new Date(),
  },
];

function applyFilter(
  items: TestArticle[],
  searchTerm: string,
  readFilter: "all" | "unread" | "read"
) {
  const base = searchTerm
    ? items.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;
  return base.filter((a) => {
    if (readFilter === "all") return true;
    if (readFilter === "unread") return !a.isRead;
    return a.isRead;
  });
}

describe("Read filter logic", () => {
  it("devuelve todos cuando readFilter = all", () => {
    const result = applyFilter(articles, "", "all");
    expect(result).toHaveLength(4);
  });

  it("devuelve solo no leídos cuando readFilter = unread", () => {
    const result = applyFilter(articles, "", "unread");
    expect(result).toHaveLength(2);
    expect(result.every((a) => !a.isRead)).toBe(true);
  });

  it("devuelve solo leídos cuando readFilter = read", () => {
    const result = applyFilter(articles, "", "read");
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.isRead)).toBe(true);
  });

  it("combina búsqueda y filtro: busca 'type' y no leídos", () => {
    const result = applyFilter(articles, "type", "unread");
    expect(result).toHaveLength(1);
    expect(result[0].title).toMatch(/TypeScript/i);
    expect(result[0].isRead).toBe(false);
  });

  it("combina búsqueda y filtro: busca 'web' y leídos", () => {
    const result = applyFilter(articles, "web", "read");
    expect(result).toHaveLength(1);
    expect(result[0].title).toMatch(/Accesibilidad Web/i);
    expect(result[0].isRead).toBe(true);
  });
});
