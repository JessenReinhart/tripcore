export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export type PlaceSuggestion = {
  displayName: string;
  lat: number;
  lng: number;
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '1',
    });
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'TripCore-PWA/1.0',
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

const PHOTON_URL = 'https://photon.komoot.io/api';

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: '5',
      lang: 'en',
    });
    const response = await fetch(`${PHOTON_URL}/?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data?.features?.length) return [];
    return data.features.map((f: any) => {
      const p = f.properties;
      const name = [p.name, p.street, p.city, p.state, p.country]
        .filter(Boolean)
        .join(', ');
      const [lng, lat] = f.geometry.coordinates;
      return { displayName: name, lat, lng };
    });
  } catch {
    return [];
  }
}
