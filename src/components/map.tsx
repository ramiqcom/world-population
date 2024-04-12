'use client';

import { point } from '@turf/turf';
import { Map, RasterTileSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect } from 'react';
import years from '../data/years.json';
import { calculatePop } from '../module/calculate';
import { Context } from '../module/store';
import { VisObject } from '../module/type';

export default function MapCanvas() {
  const {
    map,
    setMap,
    year,
    visParam,
    style,
    tiles,
    setTiles,
    setData,
    setStatus,
    popMapShow,
    trendShow,
    trendVisParam,
    setDownloadLink,
    geojson,
  } = useContext(Context);

  const mapId = 'map';
  const popId = 'pop';
  const trendId = 'trend';

  async function loadData(year: number, visParam: VisObject, map: Map): Promise<void> {
    try {
      setStatus('Generating map...');

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

      setStatus(undefined);
    } catch ({ message }) {
      setStatus(message);
    }
  }

  async function loadTrendData(visParam: VisObject, map: Map): Promise<void> {
    try {
      setStatus('Generating trend map...');

      const res = await fetch('/trend', {
        method: 'POST',
        body: JSON.stringify({ visParam }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { urlFormat, message } = await res.json();

      if (!res.ok) {
        throw new Error(message);
      }

      map.addSource(trendId, {
        type: 'raster',
        tiles: [urlFormat],
        tileSize: 256,
      });

      map.addLayer({
        id: trendId,
        type: 'raster',
        source: trendId,
        maxzoom: 15,
        minzoom: 0,
        layout: {
          visibility: trendShow ? 'visible' : 'none',
        },
      });

      setStatus(undefined);
    } catch ({ message }) {
      setStatus(message);
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

    map.on('click', async (e) => {
      try {
        setStatus('Generating chart...');

        const geojson = point(e.lngLat.toArray()).geometry;
        const values = await calculatePop(geojson);

        setData({
          labels: years,
          datasets: [{ data: values, fill: true, label: 'Population' }],
        });

        // Set array only for csv
        const dataOnly = years.map((year, index) => [year, values[index]]);
        dataOnly.unshift(['Year', 'Population']);

        // Create string from the data
        const strings = dataOnly.map((arr) => arr.join(', ')).join('\n');

        // Create link for download
        const link = encodeURI(`data:text/csv;charset=utf-8,${strings}`);
        setDownloadLink(link);

        setStatus(undefined);
      } catch ({ message }) {
        setStatus(message);
      }
    });
  }, []);

  // Generate pop map
  useEffect(() => {
    if (map) {
      loadData(year, visParam, map);
    }
  }, [map, year, visParam]);

  // Generate pop map
  useEffect(() => {
    if (map) {
      loadTrendData(trendVisParam, map);
    }
  }, [map, visParam]);

  // Show or hide pop map
  useEffect(() => {
    if (map && map.getSource(popId)) {
      map.setLayoutProperty(popId, 'visibility', popMapShow ? 'visible' : 'none');
    }
  }, [popMapShow]);

  // Show or hide trend map
  useEffect(() => {
    if (map && map.getSource(trendId)) {
      map.setLayoutProperty(trendId, 'visibility', trendShow ? 'visible' : 'none');
    }
  }, [trendShow]);

  return <div id={mapId}></div>;
}
