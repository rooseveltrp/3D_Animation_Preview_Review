import { useRef, useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import ViewportControls from './ViewportControls';

function CameraController({ model }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (!model || !controls) return;
    
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    cameraZ *= 1.5;
    
    camera.position.set(center.x, center.y + size.y * 0.3, center.z + cameraZ);
    camera.lookAt(center);
    
    controls.target.copy(center);
    controls.update();
  }, [model, camera, controls]);
  
  return null;
}

function FBXModel({ url, animations, currentAnimation, onLoadComplete, isPlaying, currentTime, onTimeUpdate, onDurationChange }) {
  const meshRef = useRef();
  const mixerRef = useRef();
  const [model, setModel] = useState(null);
  const [loadedAnimations, setLoadedAnimations] = useState([]);
  const [animationDuration, setAnimationDuration] = useState(0);
  const currentActionRef = useRef();

  useEffect(() => {
    if (!url) return;

    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        fbx.scale.setScalar(0.01);
        fbx.position.set(0, 0, 0);
        
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const mixer = new THREE.AnimationMixer(fbx);
        mixerRef.current = mixer;

        if (fbx.animations.length > 0) {
          setLoadedAnimations(fbx.animations);
        }

        setModel(fbx);
        onLoadComplete?.(fbx, fbx.animations);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      (error) => {
        console.error('Error loading FBX:', error);
      }
    );

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [url, onLoadComplete]);

  useEffect(() => {
    if (!animations.length || !loadedAnimations.length || !mixerRef.current) return;

    const currentAnim = animations.find(anim => anim.name === currentAnimation);
    if (!currentAnim) return;

    const loader = new FBXLoader();
    loader.load(
      currentAnim.url,
      (animFbx) => {
        if (animFbx.animations.length > 0) {
          const currentAction = mixerRef.current._actions.find(action => action.isRunning());
          const newAction = mixerRef.current.clipAction(animFbx.animations[0]);
          
          if (currentAction) {
            currentAction.fadeOut(0.2);
          }
          
          newAction.reset();
          newAction.fadeIn(0.2);
          newAction.play();
          
          currentActionRef.current = newAction;
          const duration = animFbx.animations[0].duration;
          setAnimationDuration(duration);
          
          if (onDurationChange) {
            onDurationChange(duration);
          }
          
          newAction.paused = !isPlaying;
        }
      }
    );
  }, [currentAnimation, animations, loadedAnimations]);

  useEffect(() => {
    if (currentActionRef.current) {
      currentActionRef.current.paused = !isPlaying;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentActionRef.current && typeof currentTime === 'number') {
      const action = currentActionRef.current;
      action.time = currentTime;
      mixerRef.current.update(0);
    }
  }, [currentTime]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      if (isPlaying) {
        mixerRef.current.update(delta);
      }
      
      if (currentActionRef.current && onTimeUpdate) {
        onTimeUpdate(currentActionRef.current.time);
      }
    }
  });

  return model ? <primitive ref={meshRef} object={model} /> : null;
}

function Scene3D({ modelUrl, animations, currentAnimation, onModelLoad, onCanvasReady, lightingType = 'studio', isPlaying = true, currentTime, onTimeUpdate, onDurationChange }) {
  const canvasRef = useRef();
  const controlsRef = useRef();
  const [loadedModel, setLoadedModel] = useState(null);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isRotateMode, setIsRotateMode] = useState(true);

  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  const handleModelLoad = useCallback((model, animations) => {
    setLoadedModel(model);
    onModelLoad?.(model, animations);
  }, [onModelLoad]);

  const lightingConfigs = useMemo(() => ({
    'outdoor-sunset': {
      environment: 'sunset',
      ambientIntensity: 0.3,
      directionalLight: {
        position: [5, 8, 5],
        intensity: 1.2,
        color: '#ffaa66'
      }
    },
    'outdoor-day': {
      environment: 'city',
      ambientIntensity: 0.6,
      directionalLight: {
        position: [10, 15, 10],
        intensity: 1.5,
        color: '#ffffff'
      }
    },
    'studio': {
      environment: 'studio',
      ambientIntensity: 0.5,
      directionalLight: {
        position: [10, 10, 5],
        intensity: 1,
        color: '#ffffff'
      }
    }
  }), []);

  const lighting = lightingConfigs[lightingType] || lightingConfigs.studio;

  const handleResetView = () => {
    if (controlsRef.current && loadedModel) {
      const box = new THREE.Box3().setFromObject(loadedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 1.5;
      
      controlsRef.current.target.copy(center);
      controlsRef.current.object.position.set(
        center.x,
        center.y + size.y * 0.3,
        center.z + distance
      );
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const direction = new THREE.Vector3();
      controlsRef.current.object.getWorldDirection(direction);
      controlsRef.current.object.position.addScaledVector(direction, 2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const direction = new THREE.Vector3();
      controlsRef.current.object.getWorldDirection(direction);
      controlsRef.current.object.position.addScaledVector(direction, -2);
      controlsRef.current.update();
    }
  };

  const handleTogglePan = () => {
    setIsPanMode(!isPanMode);
    if (controlsRef.current) {
      controlsRef.current.enablePan = !isPanMode;
    }
  };

  const handleToggleRotate = () => {
    setIsRotateMode(!isRotateMode);
    if (controlsRef.current) {
      controlsRef.current.enableRotate = !isRotateMode;
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
      <ViewportControls
        onResetView={handleResetView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onTogglePan={handleTogglePan}
        onToggleRotate={handleToggleRotate}
        isPanMode={isPanMode}
        isRotateMode={isRotateMode}
      />
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 5, 10], fov: 50 }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <Environment preset={lighting.environment} key={lightingType} />
          <ambientLight intensity={lighting.ambientIntensity} />
          <directionalLight
            position={lighting.directionalLight.position}
            intensity={lighting.directionalLight.intensity}
            color={lighting.directionalLight.color}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          <Center>
            <FBXModel
              url={modelUrl}
              animations={animations}
              currentAnimation={currentAnimation}
              onLoadComplete={handleModelLoad}
              isPlaying={isPlaying}
              currentTime={currentTime}
              onTimeUpdate={onTimeUpdate}
              onDurationChange={onDurationChange}
            />
          </Center>
          
          <CameraController model={loadedModel} />
          
          <OrbitControls
            ref={controlsRef}
            enablePan={isPanMode}
            enableZoom={true}
            enableRotate={isRotateMode}
            minDistance={2}
            maxDistance={50}
          />
          
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Scene3D;