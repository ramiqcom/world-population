import { bbox, Geometry, point } from '@turf/turf';
import { GeoJSONSource, LngLatBoundsLike, Map, RasterTileSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect, useState } from 'react';
import { calculateValues } from '../module/server';
import { Context } from '../module/store';

export default function MapCanvas() {
  const {
    map,
    setMap,
    style,
    setData,
    setStatus,
    popMapShow,
    trendShow,
    setDownloadLink,
    years,
    tile,
    trendTile,
    geojson,
  } = useContext(Context);

  const mapId = 'map';
  const popId = 'pop';
  const trendId = 'trend';
  const vectorId = 'vector';

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const map = new Map({
      container: mapId,
      center: [130, 0],
      zoom: 4,
      style,
    });
    setMap(map);

    map.on('load', () => {
      setMapLoaded(true);
    });

    map.on('click', async (e) => {
      try {
        setStatus('Generating chart...');

        const geojson = point(e.lngLat.toArray()).geometry;
        const { values } = await calculateValues({ geojson: geojson as Geometry });

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

  useEffect(() => {
    if (mapLoaded) {
      if (map.getSource(popId)) {
        const source = map.getSource(popId) as RasterTileSource;
        source.setTiles([tile]);
      } else {
        map.addSource(popId, {
          type: 'raster',
          tiles: [tile],
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
  }, [mapLoaded, tile]);

  useEffect(() => {
    if (mapLoaded) {
      map.addSource(trendId, {
        type: 'raster',
        tiles: [trendTile],
        tileSize: 256,
      });

      map.addLayer(
        {
          id: trendId,
          type: 'raster',
          source: trendId,
          maxzoom: 15,
          minzoom: 0,
          layout: {
            visibility: trendShow ? 'visible' : 'none',
          },
        },
        popId,
      );
    }
  }, [mapLoaded, trendTile]);

  // Show geojson
  useEffect(() => {
    if (mapLoaded && geojson) {
      if (map.getSource(vectorId)) {
        const source = map.getSource(vectorId) as GeoJSONSource;
        source.setData(geojson);
      } else {
        map.addSource(vectorId, {
          type: 'geojson',
          data: geojson,
        });
        map.addLayer({
          source: vectorId,
          id: vectorId,
          type: 'line',
          paint: {
            'line-color': 'cyan',
            'line-width': 4,
          },
        });
      }

      const bounds = bbox(geojson);
      map.fitBounds(bounds as LngLatBoundsLike);
    }
  }, [mapLoaded, geojson]);

  // Show or hide pop map
  useEffect(() => {
    if (mapLoaded && map.getSource(popId)) {
      map.setLayoutProperty(popId, 'visibility', popMapShow ? 'visible' : 'none');
    }
  }, [mapLoaded, popMapShow]);

  // Show or hide trend map
  useEffect(() => {
    if (mapLoaded && map.getSource(trendId)) {
      map.setLayoutProperty(trendId, 'visibility', trendShow ? 'visible' : 'none');
    }
  }, [mapLoaded, trendShow]);

  return <div id={mapId}></div>;
}
