import { ChartData, ChartTypeRegistry } from 'chart.js';
import { Map } from 'maplibre-gl';
import { Dispatch, SetStateAction } from 'react';

export type VisObject = {
  bands?: string[];
  min: number[];
  max: number[];
  palette?: string[];
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
  setYear: Dispatch<SetStateAction<number>>;
  visParam: VisObject;
  setVisParam: Dispatch<SetStateAction<VisObject>>;
  map: Map;
  setMap: Dispatch<SetStateAction<Map>>;
  style: string;
  setStyle: Dispatch<SetStateAction<string>>;
  tiles: Record<number, string>;
  setTiles: Dispatch<SetStateAction<Record<number, string>>>;
  data: ChartData<keyof ChartTypeRegistry>;
  setData: Dispatch<SetStateAction<ChartData<keyof ChartTypeRegistry>>>;
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  popMapShow: boolean;
  setPopMapShow: Dispatch<SetStateAction<boolean>>;
};
