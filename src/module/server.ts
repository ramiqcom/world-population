'use server';

import ee from '@google/earthengine';
import { Geometry } from '@turf/turf';
import years from '../data/years.json';
import { authenticate, evaluate, getMapId } from './ee';
import { MapId, VisObject } from './type';

export async function ghsl(body: { year: number; visParam: VisObject }) {
  await authenticate();

  const { year, visParam } = body;

  const ghsl: ee.Image = ee.Image(`JRC/GHSL/P2023A/GHS_POP/${year}`).selfMask();

  const { urlFormat }: MapId = await getMapId(ghsl, visParam);

  return { urlFormat };
}

export async function trend(body: { visParam: VisObject }) {
  const { visParam } = body;

  await authenticate();

  const startPop: ee.Image = ee.Image(`JRC/GHSL/P2023A/GHS_POP/1975`);
  const endPop: ee.Image = ee.Image(`JRC/GHSL/P2023A/GHS_POP/2030`);
  const mask = startPop.gt(0).or(endPop.gt(0));

  const trend: ee.Image = endPop
    .subtract(startPop)
    .divide(2030 - 1975)
    .divide(startPop)
    .multiply(100)
    .updateMask(mask);

  const { urlFormat }: MapId = await getMapId(trend, visParam);

  return { urlFormat };
}

export async function calculateValues(body: { geojson: Geometry }): Promise<{ values: any[] }> {
  const { geojson } = body;

  await authenticate();

  const geometry: ee.Geometry = ee.Geometry(geojson);

  const col: ee.Image = ee
    .ImageCollection('JRC/GHSL/P2023A/GHS_POP')
    .toBands()
    .rename(years.map((year) => `pop_${year}`));

  const reduce: ee.Dictionary = col.reduceRegion({
    reducer: ee.Reducer.sum(),
    scale: 100,
    geometry: geometry,
    maxPixels: 1e13,
  });

  const values: ee.List = reduce.values().map((value) => ee.Number(value).toInt());

  const evaluateData: number[] = await evaluate(values);

  return { values: evaluateData };
}
