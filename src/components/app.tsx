'use client';

import { dissolve, FeatureCollection, flatten } from '@turf/turf';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { Map } from 'maplibre-gl';
import { useContext, useState } from 'react';
import { loadGeojson } from '../module/geodata';
import { calculateValues, ghsl } from '../module/server';
import { Context } from '../module/store';
import { VisObject } from '../module/type';
import ChartCanvas from './chart';
import MapCanvas from './map';

export default function Home({
  defaultStates,
}: {
  defaultStates: {
    years: number[];
    year: number;
    visParam: VisObject;
    trendVisParam: VisObject;
    tiles: Record<string, string>;
    trendTile: string;
    style: string;
  };
}) {
  const [status, setStatus] = useState<string>();
  const [popMapShow, setPopMapShow] = useState(true);
  const [tile, setTile] = useState(defaultStates.tiles[defaultStates.year]);
  const [tiles, setTiles] = useState(defaultStates.tiles);
  const [year, setYear] = useState(defaultStates.year);
  const [trendShow, setTrendShow] = useState(false);
  const [map, setMap] = useState<Map>();
  const [style, setStyle] = useState(defaultStates.style);
  const [data, setData] = useState<ChartData<keyof ChartTypeRegistry>>();
  const [downloadLink, setDownloadLink] = useState<string>();
  const [analysisOption, setAnalysisOption] = useState('click');
  const [geojson, setGeojson] = useState<FeatureCollection<any>>();

  const contextState = {
    status,
    setStatus,
    year,
    setYear,
    tile,
    setTile,
    visParam: defaultStates.visParam,
    map,
    setMap,
    style,
    setStyle,
    tiles,
    setTiles,
    data,
    setData,
    popMapShow,
    setPopMapShow,
    trendVisParam: defaultStates.trendVisParam,
    trendShow,
    setTrendShow,
    downloadLink,
    setDownloadLink,
    analysisOption,
    setAnalysisOption,
    geojson,
    setGeojson,
    years: defaultStates.years,
    trendTile: defaultStates.trendTile,
  };

  return (
    <Context.Provider value={contextState}>
      <Float />
      <MapCanvas />
    </Context.Provider>
  );
}

function Float() {
  return (
    <div id='float'>
      <Panel />
    </div>
  );
}

function Panel() {
  const { status } = useContext(Context);

  return (
    <div className='float-panel flexible vertical gap'>
      <div className='title'>World Population Explorer</div>
      <Population />
      <Trend />
      <Identify />
      <div className='text-center'>{status}</div>
      <div style={{ fontSize: 'xx-small' }}>
        Data source: Schiavina, Marcello; Freire, Sergio; Alessandra Carioli; MacManus, Kytt (2023):
        GHS-POP R2023A - GHS population grid multitemporal (1975-2030). European Commission, Joint
        Research Centre (JRC) PID: http://data.europa.eu/89h/2ff68a52-5b5b-4a22-8f40-c41da8332cfe
        doi:10.2905/2FF68A52-5B5B-4A22-8F40-C41DA8332CFE
      </div>
    </div>
  );
}

function Trend() {
  const { trendVisParam, trendShow, setTrendShow } = useContext(Context);
  const { palette, max, min } = trendVisParam;

  return (
    <div className='flexible small-gap' style={{ border: 'thin solid white', padding: '2%' }}>
      <input
        type='checkbox'
        style={{ width: '4%' }}
        checked={trendShow}
        onChange={(e) => setTrendShow(e.target.checked)}
      />

      <div className='flexible vertical small-gap' style={{ width: '90%' }}>
        <div>Trend per year</div>

        <div className='text-center' style={{ fontSize: 'small' }}>
          <div className='flexible wide small-gap'>
            {min}%
            <div
              style={{
                background: `linear-gradient(to right, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
                width: '100%',
                height: '2vh',
                border: 'thin solid white',
              }}
            ></div>
            +{max}%
          </div>
          People/Ha
        </div>
      </div>
    </div>
  );
}

function Population() {
  const { year, setYear, visParam, popMapShow, setPopMapShow, years, setTile, tiles } =
    useContext(Context);
  const [tempYear, setTempYear] = useState(year);
  const { palette, max, min } = visParam;

  return (
    <div className='flexible small-gap' style={{ border: 'thin solid white', padding: '2%' }}>
      <input
        type='checkbox'
        style={{ width: '4%' }}
        checked={popMapShow}
        onChange={(e) => setPopMapShow(e.target.checked)}
      />

      <div className='flexible vertical small-gap' style={{ width: '90%' }}>
        <div>Population map</div>

        <div>
          <input
            type='range'
            value={tempYear}
            min={years.at(0)}
            max={years.at(-1)}
            step={5}
            onChange={(e) => setTempYear(Number(e.target.value))}
            onMouseUp={async () => {
              setYear(tempYear);

              let url: string;
              if (!tiles[tempYear]) {
                const { urlFormat } = await ghsl({ year: tempYear, visParam });
                url = urlFormat;
              } else {
                url = tiles[tempYear];
              }

              setTile(url);
            }}
            style={{
              width: '100%',
            }}
          />

          <div style={{ width: '100%', fontSize: 'xx-small' }} className='flexible wide'>
            {years.map((year, index) => (
              <div key={index}>{year}</div>
            ))}
          </div>
        </div>

        <div className='text-center' style={{ fontSize: 'small' }}>
          <div className='flexible wide small-gap'>
            {min}
            <div
              style={{
                background: `linear-gradient(to right, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]})`,
                width: '100%',
                height: '2vh',
                border: 'thin solid white',
              }}
            ></div>
            {max}
          </div>
          People/Ha
        </div>
      </div>
    </div>
  );
}

function Identify() {
  const { analysisOption, setAnalysisOption } = useContext(Context);

  // chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: 'Population',
        },
      },
      x: {
        stacked: true,
      },
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
      },
    },
  };

  return (
    <div className='flexible vertical text-center small-gap'>
      <div className='title'>Analysis</div>
      <div className='flexible wide'>
        <button
          className='button-select'
          disabled={analysisOption == 'click'}
          onClick={() => setAnalysisOption('click')}
        >
          Click
        </button>
        <button
          className='button-select'
          disabled={analysisOption !== 'click'}
          onClick={() => setAnalysisOption('polygon')}
        >
          Polygon
        </button>
      </div>

      {analysisOption == 'click' ? 'Click map to see the value' : <Upload />}

      <ChartPop />
    </div>
  );
}

function ChartPop() {
  const {
    data,
    downloadLink,
    analysisOption,
    geojson,
    setStatus,
    setData,
    setDownloadLink,
    years,
  } = useContext(Context);

  const [disabledCalculate, setDisabledCalculate] = useState(true);

  // chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: 'Population',
        },
      },
      x: {
        stacked: true,
      },
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
      },
    },
  };

  return (
    <div style={{ width: '100%' }}>
      {analysisOption !== 'click' ? (
        <button
          style={{ width: '100%' }}
          disabled={geojson && disabledCalculate ? false : true}
          onClick={async () => {
            try {
              setDisabledCalculate(false);
              setStatus('Generating chart...');

              const { values } = await calculateValues({ geojson: geojson.features[0].geometry });

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
            } finally {
              setDisabledCalculate(true);
            }
          }}
        >
          Calculate
        </button>
      ) : null}

      {data ? (
        <ChartCanvas options={options} type='line' data={data} height='50%' width='100%' />
      ) : undefined}

      {downloadLink ? (
        <a download='population_data' href={downloadLink} style={{ width: '100%' }}>
          <button style={{ width: '100%' }}>Download data</button>
        </a>
      ) : undefined}
    </div>
  );
}

function Upload() {
  const { setStatus, setGeojson } = useContext(Context);

  return (
    <div className='flexible vertical small-gap'>
      Upload shapefile in zip, geojson, or kml
      <input
        type='file'
        accept='.zip,.geojson,.json,.kml,.kmz'
        onChange={async (e) => {
          try {
            setStatus('Load file...');
            const file = e.target.files[0];
            let geojson = await loadGeojson(file);
            geojson = flatten(geojson);
            geojson = dissolve(geojson);
            setGeojson(geojson);
            setStatus(undefined);
          } catch ({ message }) {
            setStatus(message);
          }
        }}
      />
    </div>
  );
}
