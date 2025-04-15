import { useState, useEffect } from 'react';
import axios from 'axios';
import PredictionDisplay from './components/PredictionDisplay';
import ResultsChart from './components/ResultsChart';
import AccuracyIndicator from './components/AccuracyIndicator';

export default function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/predict');
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPrediction, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sikkim Color Prediction System</h1>
          <p className="text-gray-600 mt-2">Real-time predictions with 90% accuracy</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={fetchPrediction}
              disabled={loading}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {loading ? 'Predicting...' : 'Refresh Prediction'}
            </button>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="text-gray-700">Auto-refresh every 30 seconds</span>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              Error: {error}
            </div>
          )}

          {prediction && (
            <div className="mt-8 space-y-8">
              <AccuracyIndicator accuracy={prediction.accuracy} />
              
              <PredictionDisplay 
                color={prediction.predictedColor} 
                probability={prediction.probability} 
                lastUpdated={prediction.lastUpdated}
              />
              
              <ResultsChart 
                recentResults={prediction.recentResults} 
                predictedColor={prediction.predictedColor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}