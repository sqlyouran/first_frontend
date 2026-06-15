import { describe, it, expect } from "vitest";
import { mockSpots, mockCities } from "./spots";

describe("mockSpots", () => {
  it("has exactly 15 items", () => {
    expect(mockSpots).toHaveLength(15);
  });

  it("every spot has all required fields non-empty", () => {
    for (const spot of mockSpots) {
      expect(spot.id).toBeTruthy();
      expect(spot.name).toBeTruthy();
      expect(spot.name_zh).toBeTruthy();
      expect(spot.slug).toBeTruthy();
      expect(spot.cover_image).toBeTruthy();
      expect(spot.tags.length).toBeGreaterThan(0);
      expect(spot.city_id).toBeTruthy();
      expect(spot.city_name).toBeTruthy();
      expect(spot.rating).toBeTruthy();
      expect(spot.view_count).toBeGreaterThan(0);
      expect(spot.bookmark_count).toBeGreaterThan(0);
    }
  });

  it("rating is between 3.5 and 5.0", () => {
    for (const spot of mockSpots) {
      const r = parseFloat(spot.rating);
      expect(r).toBeGreaterThanOrEqual(3.5);
      expect(r).toBeLessThanOrEqual(5.0);
    }
  });

  it("all IDs are unique", () => {
    const ids = mockSpots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("mockCities", () => {
  it("covers 8 unique cities", () => {
    expect(mockCities).toHaveLength(8);
  });

  it("each city has id and name", () => {
    for (const city of mockCities) {
      expect(city.id).toBeTruthy();
      expect(city.name).toBeTruthy();
    }
  });
});
