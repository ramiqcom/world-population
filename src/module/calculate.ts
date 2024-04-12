import { Geometry } from '@turf/turf';

export async function calculatePop(geojson: Geometry) {
  const res = await fetch('/value', {
    method: 'POST',
    body: JSON.stringify({ geojson }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

	const { values, message }: { values: Array<any>, message: string } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return values;
}
