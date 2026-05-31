# tools/vision.py
import pyautogui
import cv2
import numpy as np
from typing import Dict, Any

class VisionTools:
    @staticmethod
    def screenshot(save_path: str = "data/screen.png"):
        pyautogui.screenshot(save_path)
        return f"Screenshot saved to {save_path}"

    @staticmethod
    def capture_camera(save_path: str = "data/camera.png"):
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        if ret:
            cv2.imwrite(save_path, frame)
            cap.release()
            return f"Camera capture saved to {save_path}"
        cap.release()
        return "Failed to capture camera"

    @staticmethod
    def mouse_move(x: int, y: int):
        pyautogui.moveTo(x, y)
        return f"Mouse moved to {x}, {y}"

    @staticmethod
    def mouse_click():
        pyautogui.click()
        return "Mouse clicked"
