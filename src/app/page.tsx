'use client';

import { ChartData, ChartTypeRegistry } from 'chart.js';
import { Map } from 'maplibre-gl';
import { useContext, useState } from 'react';
import ChartCanvas from '../components/chart';
import MapCanvas from '../components/map';
import years from '../data/years.json';
import { Context } from '../module/store';
import { VisObject } from '../module/type';

export default function Home() {
  const [status, setStatus] = useState<string>();
  const [popMapShow, setPopMapShow] = useState(true);
  const [tiles, setTiles] = useState({});
  const [year, setYear] = useState(2020);
  const [visParam, setVisParam] = useState<VisObject>({
    min: [0],
    max: [100],
    bands: ['population_count'],
    palette: ['black', 'darkgreen', 'green', 'lightgreen', 'white'],
  });
  const [map, setMap] = useState<Map>();
  const [style, setStyle] = useState(
    `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json?api_key=${process.env.NEXT_PUBLIC_STADIA_KEY}`,
  );
  const [data, setData] = useState<ChartData<keyof ChartTypeRegistry>>();

  const contextState = {
    status,
    setStatus,
    year,
    setYear,
    visParam,
    setVisParam,
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
      <Identify />

      <div className='text-center'>{status}</div>
    </div>
  );
}

function Population() {
  const { year, setYear, visParam, popMapShow, setPopMapShow } = useContext(Context);
  const [tempYear, setTempYear] = useState(year);
  const { palette } = visParam;

  return (
    <div className='flexible small-gap'>
      <input
        type='checkbox'
        style={{ width: '4%' }}
        checked={popMapShow}
        onChange={(e) => setPopMapShow(e.target.checked)}
      />

      <div className='flexible vertical gap' style={{ width: '90%' }}>
        <div>
          <input
            type='range'
            value={tempYear}
            min={years.at(0)}
            max={years.at(-1)}
            step={5}
            onChange={(e) => setTempYear(Number(e.target.value))}
            onMouseUp={() => setYear(tempYear)}
            style={{
              width: '100%',
            }}
          />

          <div style={{ width: '100%', fontSize: 'x-small' }} className='flexible wide'>
            {years.map((year, index) => (
              <div key={index}>{year}</div>
            ))}
          </div>
        </div>

        <div className='text-center' style={{ fontSize: 'small' }}>
          <div className='flexible wide gap'>
            0
            <div
              style={{
                background: `linear-gradient(to right, ${palette[0]}, ${palette[1]}, ${palette[2]}, ${palette[3]}, ${palette[4]})`,
                width: '100%',
                height: '2vh',
                border: 'thin solid white',
              }}
            ></div>
            100
          </div>
          People/Ha
        </div>
      </div>
    </div>
  );
}

function Identify() {
  const { data } = useContext(Context);

  // chart options
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: 'Population per hectare',
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
    <div className='flexible vertical text-center'>
      Click map to see the value
      <div>{data ? <ChartCanvas options={options} type='line' data={data} /> : undefined}</div>
    </div>
  );
}
