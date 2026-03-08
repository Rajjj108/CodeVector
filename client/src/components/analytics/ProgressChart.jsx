import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressChart = ({ solved, revision, pending }) => {
  const data = {
    labels: ["Solved", "Revision", "Pending"],
    datasets: [
      {
        data: [solved, revision, pending],
        backgroundColor: [
          "#22c55e",
          "#eab308",
          "#64748b",
        ],
      },
    ],
  };

  return <Doughnut data={data} />;
};

export default ProgressChart;