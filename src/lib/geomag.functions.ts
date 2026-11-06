import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GeomagResult = {
  date: number;
  latitude: number;
  longitude: number;
  elevation: number;
  declination: number;
  declination_sv: number;
  declination_uncertainty: number;
  inclination: number;
  inclination_sv: number;
  inclination_uncertainty: number;
  horintensity: number;
  horintensity_sv: number;
  horintensity_uncertainty: number;
  totalintensity: number;
  totalintensity_sv: number;
  totalintensity_uncertainty: number;
  xcomponent: number;
  xcomponent_sv: number;
  xcomponent_uncertainty: number;
  ycomponent: number;
  ycomponent_sv: number;
  ycomponent_uncertainty: number;
  zcomponent: number;
  zcomponent_sv: number;
  zcomponent_uncertainty: number;
};

export function buildGeomagUrl(lat: number, lon: number, d: Date) {
  const p = new URLSearchParams({
    lat1: lat.toFixed(4),
    lon1: lon.toFixed(4),
    model: "WMM",
    startYear: String(d.getUTCFullYear()),
    startMonth: String(d.getUTCMonth() + 1),
    startDay: String(d.getUTCDate()),
    resultFormat: "json",
    key: "EAU2y",
  });
  return `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateIgrfwmm?${p}`;
}

export const fetchGeomag = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180), date: z.string() }).parse(i),
  )
  .handler(async ({ data }) => {
    const url = buildGeomagUrl(data.lat, data.lon, new Date(data.date));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NOAA service returned ${res.status}`);
    const json = (await res.json()) as { model: string; result: GeomagResult[] };
    if (!json.result?.[0]) throw new Error("No result returned");
    return { url, model: json.model, result: json.result[0] };
  });
