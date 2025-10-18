import { describe, it, expect } from "@jest/globals";

describe("Title Click Navigation Functionality", () => {
  it("should encode title correctly for URL navigation", () => {
    // Test de la función de codificación
    const title = "React Tutorial: A Complete Guide";
    const encodedTitle = encodeURIComponent(title);
    const expectedUrl = `/articulos?search=${encodedTitle}`;
    
    expect(expectedUrl).toBe("/articulos?search=React%20Tutorial%3A%20A%20Complete%20Guide");
  });

  it("should handle special characters in title encoding", () => {
    const title = "JavaScript & TypeScript: Best Practices";
    const encodedTitle = encodeURIComponent(title);
    const expectedUrl = `/articulos?search=${encodedTitle}`;
    
    expect(expectedUrl).toBe("/articulos?search=JavaScript%20%26%20TypeScript%3A%20Best%20Practices");
  });

  it("should handle empty title", () => {
    const title = "";
    const encodedTitle = encodeURIComponent(title);
    const expectedUrl = `/articulos?search=${encodedTitle}`;
    
    expect(expectedUrl).toBe("/articulos?search=");
  });

  it("should handle titles with accented characters", () => {
    const title = "Programación en JavaScript";
    const encodedTitle = encodeURIComponent(title);
    const expectedUrl = `/articulos?search=${encodedTitle}`;
    
    expect(expectedUrl).toBe("/articulos?search=Programaci%C3%B3n%20en%20JavaScript");
  });

  it("should handle titles with quotes and special symbols", () => {
    const title = 'CSS "Grid" Layout: A Complete Guide';
    const encodedTitle = encodeURIComponent(title);
    const expectedUrl = `/articulos?search=${encodedTitle}`;
    
    expect(expectedUrl).toBe("/articulos?search=CSS%20%22Grid%22%20Layout%3A%20A%20Complete%20Guide");
  });
});

describe("URL Search Parameter Parsing", () => {
  it("should parse search parameter from URL", () => {
    const url = "http://localhost:5173/articulos?search=React%20Tutorial";
    const urlObj = new URL(url);
    const searchParam = urlObj.searchParams.get("search");
    
    expect(searchParam).toBe("React Tutorial");
  });

  it("should handle URL without search parameter", () => {
    const url = "http://localhost:5173/articulos";
    const urlObj = new URL(url);
    const searchParam = urlObj.searchParams.get("search");
    
    expect(searchParam).toBeNull();
  });

  it("should decode URL-encoded search parameters", () => {
    const url = "http://localhost:5173/articulos?search=JavaScript%20%26%20TypeScript";
    const urlObj = new URL(url);
    const searchParam = urlObj.searchParams.get("search");
    
    expect(searchParam).toBe("JavaScript & TypeScript");
  });

  it("should handle multiple search parameters", () => {
    const url = "http://localhost:5173/articulos?search=React&page=1";
    const urlObj = new URL(url);
    const searchParam = urlObj.searchParams.get("search");
    const pageParam = urlObj.searchParams.get("page");
    
    expect(searchParam).toBe("React");
    expect(pageParam).toBe("1");
  });
});

describe("Navigation URL Construction", () => {
  it("should construct correct navigation URL", () => {
    const articleTitle = "React Hooks Tutorial";
    const navigateUrl = `/articulos?search=${encodeURIComponent(articleTitle)}`;
    
    expect(navigateUrl).toBe("/articulos?search=React%20Hooks%20Tutorial");
  });

  it("should handle complex titles with multiple special characters", () => {
    const articleTitle = "Node.js & Express: Building REST APIs (2024)";
    const navigateUrl = `/articulos?search=${encodeURIComponent(articleTitle)}`;
    
    expect(navigateUrl).toBe("/articulos?search=Node.js%20%26%20Express%3A%20Building%20REST%20APIs%20(2024)");
  });

  it("should maintain URL structure for navigation", () => {
    const baseUrl = "/articulos";
    const searchTerm = "Vue.js";
    const fullUrl = `${baseUrl}?search=${encodeURIComponent(searchTerm)}`;
    
    expect(fullUrl).toBe("/articulos?search=Vue.js");
    expect(fullUrl.startsWith("/articulos")).toBe(true);
    expect(fullUrl.includes("search=")).toBe(true);
  });
});
