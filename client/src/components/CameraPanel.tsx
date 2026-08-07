import { useCallback, useEffect, useRef, useState } from "react";

interface CameraPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CameraPanel({ open, onClose }: CameraPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "无法访问摄像头，请检查权限设置";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setError(null);
    }
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  if (!open) return null;

  return (
    <div className="panel camera-overlay">
      <div className="panel-header">
        <span>摄像头预览</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={startCamera} disabled={loading}>
            重试
          </button>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
      </div>
      <div className="panel-body">
        {error ? (
          <div className="camera-error">
            <p>{error}</p>
            <button type="button" className="primary" onClick={startCamera}>
              重新授权
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            playsInline
            muted
          />
        )}
      </div>
    </div>
  );
}
