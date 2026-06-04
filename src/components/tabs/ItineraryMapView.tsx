import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Activity } from "../../types";

type Props = {
  activities: Activity[];
  dayLabel: string;
};

type LocatedActivity = Activity & { lat: number; lng: number };

function createNumberedIcon(num: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;color:#fff;
      background:#ffb6b9;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      border:2px solid #fff;
      font-family:'Nunito',sans-serif;
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function MapCenterController({ activities }: { activities: LocatedActivity[] }) {
  const map = useMap();

  useEffect(() => {
    if (activities.length === 0) return;
    if (activities.length === 1) {
      map.setView([activities[0].lat, activities[0].lng], 15);
    } else {
      const latLngs = activities.map(a => [a.lat, a.lng] as [number, number]);
      const lats = latLngs.map(ll => ll[0]);
      const lngs = latLngs.map(ll => ll[1]);
      const latRange = Math.max(...lats) - Math.min(...lats);
      const lngRange = Math.max(...lngs) - Math.min(...lngs);
      if (latRange < 0.001 && lngRange < 0.001) {
        map.setView([activities[0].lat, activities[0].lng], 15);
      } else {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    }
  }, [activities, map]);

  return null;
}

export default function ItineraryMapView({ activities, dayLabel }: Props) {
  const located = activities.filter(
    (a): a is LocatedActivity => a.lat !== undefined && a.lng !== undefined
  );

  const polylinePositions: [number, number][] = located.map(a => [a.lat, a.lng]);

  return (
    <div className="rounded-3xl overflow-hidden shadow-sm border-2 border-pastel-yellow/10">
      <MapContainer
        center={[located[0].lat, located[0].lng]}
        zoom={13}
        className="h-[35vh] w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapCenterController activities={located} />
        {located.map((act, i) => (
          <Marker
            key={act.id}
            position={[act.lat, act.lng]}
            icon={createNumberedIcon(i + 1)}
          >
            <Popup>
              <div className="font-sans text-sm">
                <p className="font-bold text-ink">{act.title}</p>
                <p className="text-ink-light text-xs mt-0.5">
                  {act.time} — {dayLabel}
                </p>
                {act.location && (
                  <p className="text-ink-light text-xs mt-0.5">{act.location}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {polylinePositions.length >= 2 && (
          <Polyline
            positions={polylinePositions}
            color="#dcd6f7"
            weight={3}
            dashArray="8 6"
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}
