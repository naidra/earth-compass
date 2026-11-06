import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = { point: { lat: number; lon: number } | null; onPick: (lat: number, lon: number) => void };

export default function WorldMap({ point, onPick }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { worldCopyJump: true, minZoom: 2 }).setView([30, 10], 2);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(m);
    m.on("click", (e) => pickRef.current(e.latlng.lat, L.Util.wrapNum(e.latlng.lng, [-180, 180], true)));
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !point) return;
    if (!marker.current) {
      marker.current = L.circleMarker([point.lat, point.lon], {
        radius: 9, color: "#f5b942", weight: 3, fillColor: "#f5b942", fillOpacity: 0.35,
      }).addTo(m);
    } else marker.current.setLatLng([point.lat, point.lon]);
  }, [point]);

  return <div ref={el} className="h-full w-full" />;
}
