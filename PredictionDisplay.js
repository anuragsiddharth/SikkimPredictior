export default function PredictionDisplay({ color, probability, lastUpdated }) {
  const getColorClass = (color) => {
    switch (color) {
      case 'Red': return 'bg-red-500';
      case 'Green': return 'bg-green-500';
      case 'Violet': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border-l-8 shadow-sm" style={{ borderColor: color === 'Red' ? '#EF4444' : color === 'Green' ? '#10B981' : '#8B5CF6' }}>
      <h3 className="text-xl font-semibold mb-4">Next Color Prediction</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-20 h-20 rounded-full ${getColorClass(color)} flex items-center justify-center text-white text-4xl font-bold mr-6`}>
            {color.charAt(0)}
          </div>
          <div>
            <p className="text-2xl font-bold">{color}</p>
            <p className="text-gray-600 mt-1">Predicted with {(probability * 100).toFixed(1)}% confidence</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-gray-700 font-medium">
            {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}