'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  labels: string[];
  data: number[];
}

export default function UserGrowthChart({ labels, data }: Props) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Thành viên mới',
        data: data,
        borderColor: 'rgb(59, 130, 246)', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4, // Làm mềm đường kẻ
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thống kê người dùng mới (7 ngày qua)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1 // Chỉ hiện số nguyên (người dùng không thể lẻ)
        }
      }
    }
  };

  return <Line options={options} data={chartData} />;
}