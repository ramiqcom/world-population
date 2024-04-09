import { Chart, ChartData, ChartTypeRegistry } from 'chart.js/auto';
import { useEffect } from 'react';

type ChartProp = {
  type: keyof ChartTypeRegistry;
  options: Record<string, any>;
  data: ChartData<keyof ChartTypeRegistry> | undefined;
  height: string;
  width: string;
};

export default function ChartCanvas({ type, options, data, height, width }: ChartProp) {
  const chartId: string = 'chart';

  useEffect(() => {
    if (type && options && data) {
      const doc = document.getElementById(chartId) as HTMLCanvasElement;
      const chart = new Chart(doc, {
        type,
        options,
        data,
      });

      return () => {
        // Destroy chart when done
        chart.destroy();
      };
    }
  }, [type, options, data]);

  return (
    <div>
      <canvas id={chartId} height={height} width={width}></canvas>
    </div>
  );
}
