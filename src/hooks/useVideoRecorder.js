import { useRef, useCallback } from 'react';

export function useVideoRecorder() {
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const startRecording = useCallback(async (canvas, duration = 5000) => {
    try {
      recordedChunksRef.current = [];
      
      const stream = canvas.captureStream(30);
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `animation_${Date.now()}.webm`;
        link.click();
        
        URL.revokeObjectURL(url);
      };

      mediaRecorderRef.current.start();
      
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, duration);

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { startRecording, stopRecording };
}