export type PlaceSuggestion = {
  displayName: string;
  lat: number;
  lng: number;
};

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
