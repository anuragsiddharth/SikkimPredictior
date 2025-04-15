import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsChart({ recentResults, predictedColor }) {
  const getColorCode = (color) => {
    return color === 'Red' ? '#EF4444' : color === 'Green' ? '#10B981' : '#8B5CF6';
  };

  const data = {
    labels: recentResults.map((_, i) => `Game ${i + 1}`),
    datasets: [
      {
        label: 'Results',
        data: recentResults.map(r => r.color === 'Red' ? 1 : r.color === 'Green' ? 2 : 3),
        backgroundColor: recentResults.map(r => getColorCode(r.color)),
        borderColor: recentResults.map(r => getColorCode(r.color)),
        borderWidth: 1
      },
      {
        label: 'Prediction',
        data: recentResults.map((_, i) => i === 0 ? (predictedColor === 'Red' ? 1 : predictedColor === 'Green' ? 2 : 3) : null),
        backgroundColor: getColorCode(predictedColor),
        borderColor: getColorCode(predictedColor),
        borderWidth: 2,
        type: 'line',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const result = recentResults[context.dataIndex];
            if (context.datasetIndex === 0) {
              return `${result.color} (${result.size}) - ${result.number}`;
            } else {
              return `Predicted: ${predictedColor}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return value === 1 ? 'Red' : value === 2 ? 'Green' : 'Violet';
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Recent Results & Prediction</h3>
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}