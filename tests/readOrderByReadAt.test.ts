import { markArticleAsRead } from "../src/domain/Article";

describe("Orden por fecha de lectura cuando filtro = read", () => {
  const base = [
    { id: 1, title: "A", url: "u1", isRead: false, dateAdded: new Date() },
    { id: 2, title: "B", url: "u2", isRead: true, dateAdded: new Date(), readAt: new Date("2023-01-01T10:00:00Z") },
    { id: 3, title: "C", url: "u3", isRead: true, dateAdded: new Date(), readAt: new Date("2024-01-01T10:00:00Z") },
  ];

  it("ordena descendente por readAt (más recientes primero)", () => {
    const filtered = base.filter((a) => a.isRead);
    const ordered = [...filtered].sort((a, b) => {
      const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
      const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
      return bTime - aTime;
    });
    expect(ordered.map((a) => a.id)).toEqual([3, 2]);
  });

  it("coloca con readAt reciente primero tras marcar como leído", () => {
    const nowRead = markArticleAsRead(base[0] as any);
    const filtered = [base[1], base[2], nowRead].filter((a) => a.isRead);
    const ordered = [...filtered].sort((a, b) => {
      const aTime = a.readAt ? new Date(a.readAt).getTime() : 0;
      const bTime = b.readAt ? new Date(b.readAt).getTime() : 0;
      return bTime - aTime;
    });
    expect(ordered[0].id).toBe(1);
  });
});


