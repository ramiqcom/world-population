import { Map, RasterTileSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect } from 'react';
import { Context } from '../../module/store';
import { VisObject } from '../../module/type';

export default function MapCanvas() {
  const { map, setMap, year, visParam, style, tiles, setTiles, setCoord } = useContext(Context);

  const mapId = 'map';
  const popId = 'pop';

  async function loadData(year: number, visParam: VisObject, map: Map): Promise<void> {
    let url: string;

    if (tiles[year]) {
      url = tiles[year];
    } else {
      const body = {
        year,
        visParam,
      };

      const res = await fetch('/ghsl', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { urlFormat, message } = await res.json();

      if (!res.ok) {
        throw new Error(message);
      }

      // Set generated url to url
      url = urlFormat;

      // Set generated tile
      const newTiles = tiles;
      newTiles[year] = url;
      setTiles(newTiles);
    }

    if (map.getSource(popId)) {
      const source = map.getSource(popId) as RasterTileSource;
      source.setTiles([url]);
    } else {
      map.addSource(popId, {
        type: 'raster',
        tiles: [url],
        tileSize: 256,
      });
      map.addLayer({
        id: popId,
        type: 'raster',
        source: popId,
        maxzoom: 15,
        minzoom: 0,
      });
    }
  }

  useEffect(() => {
    const map = new Map({
      container: mapId,
      center: [130, 0],
      zoom: 4,
      style,
    });
    setMap(map);

    map.on('click', (e) => {
      setCoord(e.lngLat.toArray());
    });
  }, []);

  useEffect(() => {
    if (map) {
      loadData(year, visParam, map);
    }
  }, [map, year, visParam]);

  return <div id={mapId}></div>;
}
