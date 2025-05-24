import { Video } from 'lucide-react';

function AnimationControls({ 
  animations, 
  currentAnimation, 
  onAnimationChange, 
  onStartRecording,
  isRecording,
  countdown
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-green-500/30 shadow-lg" style={{marginBottom: "10px", padding: "10px"}}>
      <h3 className="text-lg font-semibold text-green-400 mb-4">Animation Controls</h3>
      
      {animations.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Animation
            </label>
            <div className="grid grid-cols-1 gap-2">
              {animations.map((anim, index) => (
                <button
                  key={index}
                  onClick={() => onAnimationChange(anim.name)}
                  className={`px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    currentAnimation === anim.name
                      ? 'bg-green-600 text-white border-2 border-green-400 shadow-lg'
                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{anim.name}</div>
                  {currentAnimation === anim.name && (
                    <div className="text-xs text-green-200 mt-1">Currently selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6">
            <button
              onClick={onStartRecording}
              disabled={!currentAnimation || isRecording}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors w-full justify-center ${
                isRecording 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              } disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
              <Video className="w-5 h-5" />
              {isRecording ? 'Recording...' : 'Record Animation'}
            </button>
            
            {isRecording && countdown && (
              <div className="text-center mt-3 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                <p className="text-red-400 font-bold text-lg">
                  Recording: {countdown}s
                </p>
                <p className="text-xs text-red-300 mt-1">
                  Recording will stop automatically
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {animations.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          Upload animation files to see controls
        </p>
      )}
    </div>
  );
}

export default AnimationControls;