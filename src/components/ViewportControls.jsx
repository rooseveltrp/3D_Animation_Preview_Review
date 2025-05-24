import { RotateCw, Move, ZoomIn, ZoomOut, Home } from 'lucide-react';

function ViewportControls({ onResetView, onZoomIn, onZoomOut, onTogglePan, onToggleRotate, isPanMode, isRotateMode }) {
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 border border-gray-600 shadow-lg">
        <div className="flex flex-col gap-1">
          <button
            onClick={onResetView}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Reset View"
          >
            <Home className="w-4 h-4" />
          </button>
          
          <button
            onClick={onZoomIn}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={onZoomOut}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={onTogglePan}
            className={`p-2 rounded transition-colors ${
              isPanMode 
                ? 'text-cyan-400 bg-cyan-900/30' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            title="Toggle Pan Mode"
          >
            <Move className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleRotate}
            className={`p-2 rounded transition-colors ${
              isRotateMode 
                ? 'text-cyan-400 bg-cyan-900/30' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            title="Toggle Rotate Mode"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewportControls;