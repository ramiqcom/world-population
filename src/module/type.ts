import { FeatureCollection } from '@turf/turf';
import { ChartData, ChartTypeRegistry } from 'chart.js';
import { Map } from 'maplibre-gl';
import { Dispatch, SetStateAction } from 'react';

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type VisObject = {
  bands?: string[] | string;
  min: number[] | number;
  max: number[] | number;
  palette?: string[] | string;
};

export type MapId = {
  mapid: string;
  urlFormat: string;
  image: Object;
};

export type ResponseMap = {
  urlFormat?: string;
  message?: string;
};

export type GlobalContext = {
  year: number;
  setYear: SetState<number>;
  visParam: VisObject;
  trendVisParam: VisObject;
  map: Map;
  setMap: SetState<Map>;
  style: string;
  setStyle: SetState<string>;
  tile: string;
  setTile: SetState<string>;
  tiles: Record<number, string>;
  setTiles: SetState<Record<string, string>>;
  data: ChartData<keyof ChartTypeRegistry>;
  setData: SetState<ChartData<keyof ChartTypeRegistry>>;
  status: string;
  setStatus: SetState<string>;
  popMapShow: boolean;
  setPopMapShow: SetState<boolean>;
  trendShow: boolean;
  setTrendShow: SetState<boolean>;
  downloadLink: string;
  setDownloadLink: SetState<string>;
  analysisOption: string;
  setAnalysisOption: SetState<string>;
  geojson: FeatureCollection<any>;
  setGeojson: SetState<FeatureCollection<any>>;
  years: number[];
  trendTile: string;
};
