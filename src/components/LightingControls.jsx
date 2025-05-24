import { Sun, Sunset, Lightbulb } from 'lucide-react';

function LightingControls({ currentLighting, onLightingChange }) {
  const lightingOptions = [
    {
      id: 'studio',
      name: 'Studio',
      icon: Lightbulb,
      description: 'Professional studio lighting'
    },
    {
      id: 'outdoor-day',
      name: 'Outdoor Day',
      icon: Sun,
      description: 'Bright daylight environment'
    },
    {
      id: 'outdoor-sunset',
      name: 'Outdoor Sunset',
      icon: Sunset,
      description: 'Warm sunset lighting'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-purple-500/30 shadow-lg" style={{marginBottom: "10px", padding: "10px"}}>
      <h3 className="text-lg font-semibold text-purple-400 mb-4">Lighting</h3>
      
      <div className="grid grid-cols-1 gap-2">
        {lightingOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onLightingChange(option.id)}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${
                currentLighting === option.id
                  ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-lg'
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className="w-5 h-5" />
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs opacity-75 mt-1">{option.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LightingControls;