// Tests for read-state and favorite filtering logic

type TestArticle = {
  id: number;
  title: string;
  url: string;
  isRead: boolean;
  isFavorite?: boolean;
  dateAdded: Date;
};

const articles: TestArticle[] = [
  {
    id: 1,
    title: "Aprender React",
    url: "u1",
    isRead: false,
    isFavorite: false,
    dateAdded: new Date(),
  },
  {
    id: 2,
    title: "Patrones de Diseño",
    url: "u2",
    isRead: true,
    isFavorite: true,
    dateAdded: new Date(),
  },
  {
    id: 3,
    title: "TypeScript Tips",
    url: "u3",
    isRead: false,
    isFavorite: true,
    dateAdded: new Date(),
  },
  {
    id: 4,
    title: "Accesibilidad Web",
    url: "u4",
    isRead: true,
    isFavorite: false,
    dateAdded: new Date(),
  },
];

function applyFilter(
  items: TestArticle[],
  searchTerm: string,
  readFilter: "all" | "unread" | "read",
  favoriteFilter: "all" | "favorites" = "all"
) {
  const base = searchTerm
    ? items.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;
  return base.filter((a) => {
    // Apply read filter
    if (readFilter === "unread" && a.isRead) return false;
    if (readFilter === "read" && !a.isRead) return false;
    
    // Apply favorite filter
    if (favoriteFilter === "favorites" && !a.isFavorite) return false;
    
    return true;
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

describe("Favorite filter logic", () => {
  it("devuelve todos cuando favoriteFilter = all", () => {
    const result = applyFilter(articles, "", "all", "all");
    expect(result).toHaveLength(4);
  });

  it("devuelve solo favoritos cuando favoriteFilter = favorites", () => {
    const result = applyFilter(articles, "", "all", "favorites");
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.isFavorite)).toBe(true);
    expect(result.map((a) => a.id)).toEqual([2, 3]);
  });

  it("combina filtro de lectura y favoritos: favoritos no leídos", () => {
    const result = applyFilter(articles, "", "unread", "favorites");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
    expect(result[0].isRead).toBe(false);
    expect(result[0].isFavorite).toBe(true);
  });

  it("combina filtro de lectura y favoritos: favoritos leídos", () => {
    const result = applyFilter(articles, "", "read", "favorites");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
    expect(result[0].isRead).toBe(true);
    expect(result[0].isFavorite).toBe(true);
  });

  it("combina búsqueda y filtro de favoritos: busca 'typescript' y favoritos", () => {
    const result = applyFilter(articles, "typescript", "all", "favorites");
    expect(result).toHaveLength(1);
    expect(result[0].title).toMatch(/TypeScript/i);
    expect(result[0].isFavorite).toBe(true);
  });

  it("combina búsqueda, lectura y favoritos: busca 'patrones', leídos y favoritos", () => {
    const result = applyFilter(articles, "patrones", "read", "favorites");
    expect(result).toHaveLength(1);
    expect(result[0].title).toMatch(/Patrones/i);
    expect(result[0].isRead).toBe(true);
    expect(result[0].isFavorite).toBe(true);
  });
});
