import { getAiRatingTier } from "../src/domain/Article";

describe("getAiRatingTier", () => {
  it("returns low for ratings up to 4", () => {
    expect(getAiRatingTier(4)).toBe("low");
  });

  it("returns medium for ratings between 5 and 7", () => {
    expect(getAiRatingTier(5)).toBe("medium");
    expect(getAiRatingTier(7)).toBe("medium");
  });

  it("returns high for ratings above 7", () => {
    expect(getAiRatingTier(8)).toBe("high");
  });
});
