import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, MessageSquare, Download, Upload, Plus } from 'lucide-react';

function TimelineControls({ 
  isPlaying, 
  onPlayPause, 
  currentTime, 
  duration, 
  onTimeChange,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onImportComments,
  onExportComments,
  currentAnimation
}) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const fileInputRef = useRef();

  const currentFrame = Math.round((currentTime / duration) * 100) || 0;
  const currentComment = comments.find(c => c.frame === currentFrame);
  
  const progressPercentage = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  useEffect(() => {
    if (currentComment && !isPlaying) {
      setCommentText(currentComment.text);
      setEditingComment(currentComment);
    } else {
      setCommentText('');
      setEditingComment(null);
    }
  }, [currentFrame, currentComment, isPlaying]);

  const handleTimelineClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onTimeChange(newTime);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    if (editingComment) {
      onUpdateComment(editingComment.id, commentText);
    } else {
      onAddComment(currentFrame, commentText);
    }
    
    setCommentText('');
    setShowCommentForm(false);
    setEditingComment(null);
  };

  const handleDeleteComment = () => {
    if (editingComment) {
      onDeleteComment(editingComment.id);
      setCommentText('');
      setEditingComment(null);
      setShowCommentForm(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        onImportComments(data);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const frames = Math.floor((time % 1) * 30);
    return `${minutes}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  if (!currentAnimation) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30 shadow-lg" style={{padding: "10px", marginBottom: "10px"}}>
      <h3 className="text-lg font-semibold text-blue-400 mb-4">Timeline & Comments</h3>
      
      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          
          <div className="flex-1">
            <div className="text-sm text-gray-300 mb-2 flex justify-between">
              <span>Frame: {currentFrame}</span>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            
            {/* Timeline Bar */}
            <div 
              className="relative h-6 bg-gray-700 rounded-lg cursor-pointer"
              onClick={handleTimelineClick}
            >
              {/* Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg"
                style={{ 
                  width: `${progressPercentage}%`,
                  transition: isPlaying ? 'none' : 'width 0.1s ease-out'
                }}
              />
              
              {/* Comment Indicators */}
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="absolute top-0 w-1 h-full bg-yellow-400 rounded-sm"
                  style={{ left: `${comment.frame}%` }}
                  title={`Frame ${comment.frame}: ${comment.text}`}
                />
              ))}
              
              {/* Playhead */}
              <div 
                className="absolute top-0 w-2 h-full bg-white rounded-sm shadow-lg"
                style={{ 
                  left: `${progressPercentage}%`, 
                  transform: 'translateX(-50%)',
                  transition: isPlaying ? 'none' : 'left 0.1s ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Comment Controls */}
        <div className="flex items-center gap-2" style={{marginTop: "10px", marginBottom: "10px"}}>
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            disabled={isPlaying}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
            style={{padding: "5px"}}
          >
            <Plus className="w-4 h-4" />
            {currentComment ? 'Edit Comment' : 'Add Comment'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            style={{padding: "5px"}}
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          
          <button
            onClick={onExportComments}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            style={{padding: "5px"}}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Comment Form */}
        {showCommentForm && !isPlaying && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="mb-3" style={{padding: "10px"}}>
              <label className="block text-sm font-medium text-gray-300 mb-2" style={{marginBottom: "5px"}}>
                Comment for Frame {currentFrame}
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                style={{padding: "5px"}}
              />
            </div>
            
            <div className="flex gap-2" style={{padding: "5px"}}>
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                style={{padding: "5px"}}
              >
                {editingComment ? 'Update' : 'Add'} Comment
              </button>
              
              {editingComment && (
                <button
                  onClick={handleDeleteComment}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                  style={{padding: "5px"}}
                >
                  Delete
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowCommentForm(false);
                  setCommentText('');
                  setEditingComment(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                style={{padding: "5px"}}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Comment Display */}
        {currentComment && !isPlaying && !showCommentForm && (
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4" style={{padding: "10px"}}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-yellow-400 font-medium mb-1">
                  Frame {currentComment.frame}
                </div>
                <div className="text-gray-200">{currentComment.text}</div>
              </div>
              <button
                onClick={() => setShowCommentForm(true)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimelineControls;