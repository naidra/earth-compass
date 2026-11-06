import { createServerFn } from "@tanstack/react-start";
import { fetchGeomagFromNoaa, geomagInput } from "./geomag";

export const fetchGeomag = createServerFn({ method: "POST" })
  .inputValidator((input) => geomagInput.parse(input))
  .handler(({ data }) => fetchGeomagFromNoaa(data));
