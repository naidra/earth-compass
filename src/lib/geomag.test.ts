import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGeomagUrl, fetchGeomagFromNoaa } from "./geomag";

afterEach(() => vi.unstubAllGlobals());

describe("static NOAA requests", () => {
  const input = { lat: 42.6629, lon: 21.1655, date: "2026-11-06" };

  it("fetches NOAA directly without requiring an application server", async () => {
    const result = { declination: 5.2 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ model: "WMM", result: [result] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchGeomagFromNoaa(input);
    const url = buildGeomagUrl(input.lat, input.lon, new Date(input.date));
    expect(fetchMock).toHaveBeenCalledWith(url);
    expect(new URL(url).origin).toBe("https://www.ngdc.noaa.gov");
    expect(response).toEqual({ url, model: "WMM", result });
  });

  it("rejects invalid coordinates and dates before fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchGeomagFromNoaa({ ...input, lat: 91 })).rejects.toThrow();
    await expect(fetchGeomagFromNoaa({ ...input, date: "2026-02-30" })).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports upstream errors and empty results", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchGeomagFromNoaa(input)).rejects.toThrow("NOAA service returned 503");
    await expect(fetchGeomagFromNoaa(input)).rejects.toThrow("No result returned");
  });
});
