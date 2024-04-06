import 'node-self';

import ee from '@google/earthengine';
import { NextResponse } from 'next/server';
import years from '../../data/years.json';
import { authenticate, evaluate } from '../../module/ee';

export async function POST(req: Request) {
  try {
    const { coord }: { coord: number[] } = await req.json();

    await authenticate();

    const point = ee.Geometry.Point(coord);

    const col = ee
      .ImageCollection('JRC/GHSL/P2023A/GHS_POP')
      .toBands()
      .rename(years.map((year) => `pop_${year}`));

    const reduce = col.reduceRegion({
      reducer: ee.Reducer.first(),
      scale: 100,
      geometry: point,
      maxPixels: 1e13,
    });

    const values = reduce.values();

    const evaluateData = await evaluate(values);

    return NextResponse.json({ values: evaluateData }, { status: 200 });
  } catch ({ message }) {
    message = message as string;
    return NextResponse.json({ message }, { status: 404 });
  }
}