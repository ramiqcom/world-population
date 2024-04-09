import 'node-self';

import ee from '@google/earthengine';
import { NextResponse } from 'next/server';
import { authenticate, getMapId } from '../../module/ee';
import { MapId, VisObject } from '../../module/type';

export async function POST(req: Request) {
  try {
    const { start, end, visParam }: { start: number; end: number; visParam: VisObject } =
      await req.json();

    await authenticate();

    const startPop: ee.Image = ee.Image(`JRC/GHSL/P2023A/GHS_POP/${start}`);
    const endPop: ee.Image = ee.Image(`JRC/GHSL/P2023A/GHS_POP/${end}`);

    const trend: ee.Image = startPop.subtract(endPop).multiply(-1);

    const { urlFormat }: MapId = await getMapId(trend, visParam);

    return NextResponse.json({ urlFormat }, { status: 200 });
  } catch ({ message }) {
    message = message as string;
    return NextResponse.json({ message }, { status: 404 });
  }
}
