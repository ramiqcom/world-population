import { kml } from '@tmcw/togeojson';
import { area, FeatureCollection } from '@turf/turf';
import epsg from 'epsg';
import { toWgs84 } from 'reproject';
import shp from 'shpjs';

export async function loadGeojson(file: File): Promise<FeatureCollection<any>> {
  const format = file.name.split('.').at(-1).toLowerCase();

  let geojson: FeatureCollection<any>;

  // Conditional format
  switch (format) {
    case 'geojson':
    case 'json': {
      const parsed = JSON.parse(await file.text());
      geojson = parsed;
      break;
    }
    case 'zip': {
      const parsed = await shp(await file.arrayBuffer());
      geojson = parsed;
      break;
    }
    case 'kml':
    case 'kmz': {
      const parsed = kml(new DOMParser().parseFromString(await file.text(), 'application/xml'));
      geojson = parsed;
      break;
    }
    default: {
      throw new Error(`Format ${format} is not supported`);
    }
  }

  // Reproject if possible
  try {
    geojson = toWgs84(geojson, undefined, epsg);
  } catch (err) {}

  // Check geojson area
  const areaGeojson = area(geojson) / 1e6;

  // If area too big throw error
  if (areaGeojson > 1e6) {
    throw new Error(`Data area is ${areaGeojson}. Too big. Make it under 1 million km2`);
  }

  return geojson;
}
