import { useState, useEffect, useCallback, useRef } from 'react';
import Scene3D from './components/Scene3D';
import FileUpload from './components/FileUpload';
import AnimationControls from './components/AnimationControls';
import LightingControls from './components/LightingControls';
import TimelineControls from './components/TimelineControls';
import { useVideoRecorder } from './hooks/useVideoRecorder';
import { Gamepad2, Cpu, Zap } from 'lucide-react';

function App() {
  const [modelFile, setModelFile] = useState(null);
  const [modelUrl, setModelUrl] = useState(null);
  const [animationFiles, setAnimationFiles] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [canvasElement, setCanvasElement] = useState(null);
  const [lightingType, setLightingType] = useState('studio');
  const [countdown, setCountdown] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(0);
  const [comments, setComments] = useState([]);
  const timeUpdateRef = useRef(null);

  const { startRecording } = useVideoRecorder();

  const handleModelUpload = (file, url) => {
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl);
    }
    setModelFile(file);
    setModelUrl(url);
    setCurrentAnimation(null);
  };

  const handleAnimationUpload = (file, url) => {
    const animationName = file.name.replace('.fbx', '');
    setAnimationFiles(prev => [...prev, {
      name: animationName,
      file,
      url
    }]);
  };

  const removeAnimation = (index) => {
    setAnimationFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });

    if (currentAnimation && animationFiles[index]?.name === currentAnimation) {
      setCurrentAnimation(null);
    }
  };

  const handleAnimationChange = (animationName) => {
    setCurrentAnimation(animationName);
    setIsPlaying(true);
    setCurrentTime(0);
    setComments([]);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (time) => {
    setCurrentTime(time);
    setIsPlaying(false);
  };

  const handleTimeUpdate = useCallback((time) => {
    if (timeUpdateRef.current) {
      cancelAnimationFrame(timeUpdateRef.current);
    }
    
    timeUpdateRef.current = requestAnimationFrame(() => {
      setCurrentTime(time);
    });
  }, []);

  const handleDurationChange = useCallback((duration) => {
    setAnimationDuration(duration);
  }, []);

  const handleAddComment = (frame, text) => {
    const newComment = {
      id: Date.now(),
      frame,
      text,
      animation: currentAnimation,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleUpdateComment = (id, text) => {
    setComments(prev => prev.map(comment => 
      comment.id === id ? { ...comment, text } : comment
    ));
  };

  const handleDeleteComment = (id) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  };

  const handleImportComments = (data) => {
    if (Array.isArray(data.comments)) {
      setComments(data.comments);
    }
  };

  const handleExportComments = () => {
    const exportData = {
      animation: currentAnimation,
      duration: animationDuration,
      comments: comments,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentAnimation || 'animation'}_comments.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLightingChange = (lighting) => {
    setLightingType(lighting);
  };

  const handleStartRecording = async () => {
    if (!currentAnimation || !canvasElement) return;

    setIsRecording(true);
    setIsPlaying(true);
    setCountdown(10);

    const success = await startRecording(canvasElement, 10000);

    if (success) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRecording(false);
            setIsPlaying(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsRecording(false);
      setIsPlaying(false);
      setCountdown(null);
      alert('Failed to start recording. Please try again.');
    }
  };

  const handleCanvasReady = (canvas) => {
    setCanvasElement(canvas);
  };

  const handleModelLoad = useCallback((model, animations) => {
    console.log('Model loaded:', model);
    console.log('Built-in animations:', animations);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <header className="mb-12" style={{ marginBottom: "10px", padding: "10px" }}>
          <div className="flex gap-3 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              3D Animation Preview
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Professional FBX character animation previewer and exporter
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 shadow-2xl" style={{ padding: "10px", marginBottom: "10px" }}>
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">3D Viewport</h2>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {modelUrl ? (
                  <Scene3D
                    modelUrl={modelUrl}
                    animations={animationFiles}
                    currentAnimation={currentAnimation}
                    onModelLoad={handleModelLoad}
                    onCanvasReady={handleCanvasReady}
                    lightingType={lightingType}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    onTimeUpdate={handleTimeUpdate}
                    onDurationChange={handleDurationChange}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="text-lg">Upload an FBX model to begin</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6" style={{marginTop: "10px"}}>
                <div className="flex items-center gap-2 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                  <span className="text-sm">Real-time 3D</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm">FBX Support</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Gamepad2 className="w-5 h-5" />
                  <span className="text-sm">Animation Control</span>
                </div>
              </div>
            </div>

            <TimelineControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              currentTime={currentTime}
              duration={animationDuration}
              onTimeChange={handleTimeChange}
              comments={comments}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onImportComments={handleImportComments}
              onExportComments={handleExportComments}
              currentAnimation={currentAnimation}
            />

          </div>

          <div className="space-y-8">
            <FileUpload
              onModelUpload={handleModelUpload}
              onAnimationUpload={handleAnimationUpload}
              modelFile={modelFile}
              animationFiles={animationFiles}
              onRemoveAnimation={removeAnimation}
            />

            <LightingControls
              currentLighting={lightingType}
              onLightingChange={handleLightingChange}
            />

            <AnimationControls
              animations={animationFiles}
              currentAnimation={currentAnimation}
              onAnimationChange={handleAnimationChange}
              onStartRecording={handleStartRecording}
              isRecording={isRecording}
              countdown={countdown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
