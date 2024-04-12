import 'node-self';

import ee from '@google/earthengine';
import { Geometry } from '@turf/turf';
import { NextResponse } from 'next/server';
import years from '../../data/years.json';
import { authenticate, evaluate } from '../../module/ee';

export async function POST(req: Request) {
  try {
    const { geojson }: { geojson: Geometry } = await req.json();

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

    return NextResponse.json({ values: evaluateData }, { status: 200 });
  } catch ({ message }) {
    message = message as string;
    return NextResponse.json({ message }, { status: 404 });
  }
}
