import Home from '../components/app';
import years from '../data/years.json';
import { ghsl, trend } from '../module/server';

export default async function Page() {
  const year = years[8];
  const tiles = {};

  const visParam = {
    min: 0,
    max: 100,
    palette: ['black', 'darkgreen', 'green', 'lightgreen', 'white'],
  };

  const trendVisParam = {
    min: -2.5,
    max: 10,
    palette: ['blue', 'yellow', 'red'],
  };

  const { urlFormat: tile } = await ghsl({ year, visParam });
  tiles[year] = tile;

  const { urlFormat: trendTile } = await trend({ visParam: trendVisParam });

  const style = `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json?api_key=${process.env.NEXT_PUBLIC_STADIA_KEY}`;

  return (
    <>
      <Home defaultStates={{ years, year, visParam, trendVisParam, tiles, trendTile, style }} />
    </>
  );
}
