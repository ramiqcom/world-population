import 'node-self';

import ee from '@google/earthengine';
import { NextResponse } from 'next/server';
import { authenticate, getMapId } from '../../module/ee';
import { MapId, VisObject } from '../../module/type';

export async function POST(req: Request) {
  try {
    const { visParam }: { visParam: VisObject } = await req.json();

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

    return NextResponse.json({ urlFormat }, { status: 200 });
  } catch ({ message }) {
    message = message as string;
    return NextResponse.json({ message }, { status: 404 });
  }
}
