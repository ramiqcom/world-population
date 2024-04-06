import 'node-self';

import ee from '@google/earthengine';
import { NextResponse } from 'next/server';
import { authenticate, getMapId } from '../../module/ee';
import { MapId, VisObject } from '../../module/type';

export async function POST(req: Request) {
  try {
    await authenticate();

    const { year, visParam }: { year: number; visParam: VisObject } = await req.json();

    const ghsl = ee.Image(`JRC/GHSL/P2023A/GHS_POP/${year}`).selfMask();

    const { urlFormat }: MapId = await getMapId(ghsl, visParam);

    return NextResponse.json({ urlFormat }, { status: 200 });
  } catch ({ message }) {
    message = message as string;
    return NextResponse.json({ message }, { status: 404 });
  }
}
