import mss
import cv2
import numpy as np
from typing import Optional, Tuple, Dict, Any
from datetime import datetime
import threading
import queue
import os

class ScreenCapture:
    """Handles screen monitoring and capture"""
    
    def __init__(self):
        self.mss_instance = mss.mss()
        self.is_capturing = False
        self.capture_thread = None
        self.frame_queue = queue.Queue(maxsize=10)
        self.monitor_id = 1  # Primary monitor
    
    def get_monitors(self) -> list:
        """Get list of available monitors"""
        return self.mss_instance.monitors
    
    def set_monitor(self, monitor_id: int):
        """Set which monitor to capture from"""
        if 0 <= monitor_id < len(self.mss_instance.monitors):
            self.monitor_id = monitor_id
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture single screen frame"""
        try:
            monitor = self.mss_instance.monitors[self.monitor_id]
            screenshot = self.mss_instance.grab(monitor)
            
            # Convert to numpy array and BGR format
            frame = np.array(screenshot)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
            
            return frame
        except Exception as e:
            print(f"Screen capture error: {e}")
            return None
    
    def capture_region(self, x: int, y: int, width: int, height: int) -> Optional[np.ndarray]:
        """Capture specific screen region"""
        try:
            monitor = {
                "top": y,
                "left": x,
                "width": width,
                "height": height
            }
            screenshot = self.mss_instance.grab(monitor)
            frame = np.array(screenshot)
            frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
            return frame
        except Exception as e:
            print(f"Region capture error: {e}")
            return None
    
    def start_continuous_capture(self, fps: int = 30):
        """Start background continuous screen capture"""
        if self.is_capturing:
            return
        
        self.is_capturing = True
        self.capture_thread = threading.Thread(
            target=self._capture_loop,
            args=(fps,),
            daemon=True
        )
        self.capture_thread.start()
    
    def _capture_loop(self, fps: int):
        """Background capture loop"""
        delay = 1.0 / fps if fps > 0 else 0.033
        
        while self.is_capturing:
            frame = self.capture_frame()
            if frame is not None:
                try:
                    self.frame_queue.put_nowait(frame)
                except queue.Full:
                    try:
                        self.frame_queue.get_nowait()
                        self.frame_queue.put_nowait(frame)
                    except:
                        pass
            
            threading.Event().wait(delay)
    
    def stop_capture(self):
        """Stop continuous capture"""
        self.is_capturing = False
        if self.capture_thread:
            self.capture_thread.join(timeout=1)
    
    def get_latest_frame(self) -> Optional[np.ndarray]:
        """Get latest captured frame without blocking"""
        try:
            return self.frame_queue.get_nowait()
        except queue.Empty:
            return None
    
    def save_screenshot(self, filepath: str) -> bool:
        """Save single screenshot to file"""
        frame = self.capture_frame()
        if frame is not None:
            cv2.imwrite(filepath, frame)
            return True
        return False


class CameraCapture:
    """Handles camera operations"""
    
    def __init__(self, camera_id: int = 0):
        self.camera_id = camera_id
        self.cap = None
        self.is_capturing = False
        self.capture_thread = None
        self.frame_queue = queue.Queue(maxsize=10)
        self.brightness = 0
        self.contrast = 1
        self.fps = 30
    
    def initialize(self) -> bool:
        """Initialize camera"""
        try:
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                return False
            
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            return True
        except Exception as e:
            print(f"Camera initialization error: {e}")
            return False
    
    def get_available_cameras(self) -> int:
        """Find number of available cameras"""
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                cap.release()
                if i == 0:
                    return 1
            else:
                return i
        return 0
    
    def set_resolution(self, width: int, height: int):
        """Set camera resolution"""
        if self.cap:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    
    def set_brightness(self, value: int):
        """Set camera brightness (-100 to 100)"""
        self.brightness = max(-100, min(100, value))
    
    def set_fps(self, fps: int):
        """Set camera FPS"""
        self.fps = max(1, min(60, fps))
        if self.cap:
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
    
    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture single frame from camera"""
        if not self.cap or not self.cap.isOpened():
            return None
        
        try:
            ret, frame = self.cap.read()
            if not ret:
                return None
            
            # Apply brightness/contrast
            if self.brightness != 0 or self.contrast != 1:
                frame = cv2.convertScaleAbs(frame, alpha=self.contrast, beta=self.brightness)
            
            return frame
        except Exception as e:
            print(f"Camera capture error: {e}")
            return None
    
    def start_continuous_capture(self):
        """Start background continuous camera capture"""
        if not self.cap or self.is_capturing:
            return
        
        self.is_capturing = True
        self.capture_thread = threading.Thread(
            target=self._capture_loop,
            daemon=True
        )
        self.capture_thread.start()
    
    def _capture_loop(self):
        """Background capture loop"""
        delay = 1.0 / self.fps
        
        while self.is_capturing:
            frame = self.capture_frame()
            if frame is not None:
                try:
                    self.frame_queue.put_nowait(frame)
                except queue.Full:
                    try:
                        self.frame_queue.get_nowait()
                        self.frame_queue.put_nowait(frame)
                    except:
                        pass
            
            threading.Event().wait(delay)
    
    def stop_capture(self):
        """Stop continuous capture"""
        self.is_capturing = False
        if self.capture_thread:
            self.capture_thread.join(timeout=1)
    
    def get_latest_frame(self) -> Optional[np.ndarray]:
        """Get latest frame without blocking"""
        try:
            return self.frame_queue.get_nowait()
        except queue.Empty:
            return None
    
    def save_frame(self, filepath: str) -> bool:
        """Save single frame to file"""
        frame = self.capture_frame()
        if frame is not None:
            cv2.imwrite(filepath, frame)
            return True
        return False
    
    def release(self):
        """Release camera resources"""
        self.stop_capture()
        if self.cap:
            self.cap.release()


class VisionManager:
    """Central vision module manager"""
    
    def __init__(self):
        self.screen = ScreenCapture()
        self.camera = None
        self.vision_active = False
    
    def initialize_camera(self, camera_id: int = 0) -> bool:
        """Initialize camera system"""
        self.camera = CameraCapture(camera_id)
        return self.camera.initialize()
    
    def start_screen_capture(self, fps: int = 30):
        """Start screen monitoring"""
        self.screen.start_continuous_capture(fps)
    
    def stop_screen_capture(self):
        """Stop screen monitoring"""
        self.screen.stop_capture()
    
    def start_camera_capture(self):
        """Start camera monitoring"""
        if self.camera:
            self.camera.start_continuous_capture()
    
    def stop_camera_capture(self):
        """Stop camera monitoring"""
        if self.camera:
            self.camera.stop_capture()
    
    def get_screen_frame(self) -> Optional[np.ndarray]:
        """Get current screen frame"""
        return self.screen.get_latest_frame()
    
    def get_camera_frame(self) -> Optional[np.ndarray]:
        """Get current camera frame"""
        if self.camera:
            return self.camera.get_latest_frame()
        return None
    
    def get_status(self) -> Dict[str, Any]:
        """Get vision system status"""
        return {
            "screen_capturing": self.screen.is_capturing,
            "camera_available": self.camera is not None,
            "camera_capturing": self.camera.is_capturing if self.camera else False,
            "available_cameras": self.camera.get_available_cameras() if self.camera else 0
        }

# Global instance
vision_manager = VisionManager()
