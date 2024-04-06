'use client';

import { ChartData, ChartTypeRegistry } from 'chart.js';
import { Map } from 'maplibre-gl';
import { useContext, useEffect, useState } from 'react';
import ChartCanvas from '../components/chart';
import years from '../data/years.json';
import { Context } from '../module/store';
import { VisObject } from '../module/type';
import MapCanvas from './map/page';

export default function Home() {
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
  const [coord, setCoord] = useState<number[]>();

  const contextState = {
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
    coord,
    setCoord,
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
  const { year, setYear } = useContext(Context);

  const [tempYear, setTempYear] = useState(year);

  return (
    <div className='float-panel flexible vertical gap'>
      <div className='title'>World Population Explorer</div>
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

        <div style={{ width: '100%', fontSize: 'small' }} className='flexible wide'>
          {years.map((year, index) => (
            <div key={index}>{year}</div>
          ))}
        </div>
      </div>

      <Legend />

      <Identify />
    </div>
  );
}

function Legend() {
  const { visParam } = useContext(Context);
  const { palette } = visParam;

  return (
    <div className='text-center'>
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
  );
}

function Identify() {
  const { coord } = useContext(Context);

  const [data, setData] = useState<ChartData<keyof ChartTypeRegistry>>();

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

  async function generateChart(coord: number[]) {
    const res = await fetch('/value', {
      method: 'POST',
      body: JSON.stringify({ coord }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { values, message } = await res.json();

    if (!res.ok) {
      throw new Error(message);
    }

    setData({
      labels: years,
      datasets: [{ data: values, fill: true, label: 'Population' }],
    });
  }

  useEffect(() => {
    if (coord) {
      generateChart(coord);
    }
  }, [coord]);

  return (
    <div className='flexible vertical text-center'>
      Click map to see the value
      <div style={{ visibility: data ? 'visible' : 'hidden' }}>
        <ChartCanvas options={options} type='line' data={data} />
      </div>
    </div>
  );
}
