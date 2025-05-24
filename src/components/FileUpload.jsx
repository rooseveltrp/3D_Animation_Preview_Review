import { useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

function FileUpload({ onModelUpload, onAnimationUpload, modelFile, animationFiles, onRemoveAnimation }) {
  const modelInputRef = useRef();
  const animationInputRef = useRef();

  const handleModelChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.fbx')) {
      const url = URL.createObjectURL(file);
      onModelUpload(file, url);
    } else {
      alert('Please select a valid FBX file for the character model.');
    }
  };

  const handleAnimationChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.name.toLowerCase().endsWith('.fbx'));
    
    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only FBX files are supported for animations.');
    }

    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      onAnimationUpload(file, url);
    });
  };

  return (
    <div className="space-y-6">

      <div className="bg-gray-800 rounded-xl p-8 border border-cyan-500/30 shadow-lg" style={{marginBottom: "10px", padding: "10px"}}>
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <File className="w-5 h-5" />
          Character Model
        </h3>
        
        <div 
          onClick={() => modelInputRef.current?.click()}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500/50 transition-colors group"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-cyan-400 transition-colors" />
          <p className="text-gray-300 mb-2">
            {modelFile ? modelFile.name : 'Click to upload character FBX file'}
          </p>
          <p className="text-sm text-gray-500">
            Supports .fbx format
          </p>
        </div>
        
        <input
          ref={modelInputRef}
          type="file"
          accept=".fbx"
          onChange={handleModelChange}
          className="hidden"
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30" style={{marginBottom: "10px", padding: "10px"}}>
        <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
          <File className="w-5 h-5" />
          Animation Files
        </h3>
        
        <div 
          onClick={() => animationInputRef.current?.click()}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors group mb-4"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-purple-400 transition-colors" />
          <p className="text-gray-300 mb-2">
            Click to upload animation FBX files
          </p>
          <p className="text-sm text-gray-500">
            Multiple files supported • .fbx format
          </p>
        </div>
        
        <input
          ref={animationInputRef}
          type="file"
          accept=".fbx"
          multiple
          onChange={handleAnimationChange}
          className="hidden"
        />

        {animationFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Loaded Animations:</h4>
            {animationFiles.map((anim, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-3">
                <span className="text-sm text-gray-200">{anim.name}</span>
                <button
                  onClick={() => onRemoveAnimation(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;