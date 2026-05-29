import speech_recognition as sr
import pyttsx3
from typing import Optional, List, Dict, Any, Callable
import threading
import queue
from datetime import datetime
import json

class SpeechRecognitionManager:
    """Handles speech-to-text conversion"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.is_listening = False
        self.listen_thread = None
        self.transcribed_queue = queue.Queue()
        self.last_transcription = None
        self.confidence_threshold = 0.7
    
    def start_listening(self) -> bool:
        """Start background listening"""
        if self.is_listening:
            return False
        
        self.is_listening = True
        self.listen_thread = threading.Thread(
            target=self._listen_loop,
            daemon=True
        )
        self.listen_thread.start()
        return True
    
    def _listen_loop(self):
        """Background listening loop"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            
            while self.is_listening:
                try:
                    audio = self.recognizer.listen(source, timeout=1.0)
                    
                    # Try Google Speech Recognition
                    try:
                        text = self.recognizer.recognize_google(audio)
                        confidence = 0.95  # Google doesn't return confidence
                        
                        result = {
                            "text": text,
                            "confidence": confidence,
                            "timestamp": datetime.now().isoformat()
                        }
                        
                        self.transcribed_queue.put(result)
                        self.last_transcription = result
                    
                    except sr.UnknownValueError:
                        pass  # Silence or unintelligible
                    except sr.RequestError as e:
                        print(f"Speech recognition error: {e}")
                
                except sr.RequestError:
                    pass  # Timeout
    
    def stop_listening(self):
        """Stop listening"""
        self.is_listening = False
        if self.listen_thread:
            self.listen_thread.join(timeout=1)
    
    def get_transcription(self) -> Optional[Dict]:
        """Get latest transcription without blocking"""
        try:
            return self.transcribed_queue.get_nowait()
        except queue.Empty:
            return None
    
    def transcribe_file(self, filepath: str) -> Optional[str]:
        """Transcribe audio file"""
        try:
            with sr.AudioFile(filepath) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio)
                return text
        except Exception as e:
            print(f"File transcription error: {e}")
            return None
    
    def get_status(self) -> Dict[str, Any]:
        """Get recognition status"""
        return {
            "listening": self.is_listening,
            "last_text": self.last_transcription.get("text") if self.last_transcription else None,
            "last_confidence": self.last_transcription.get("confidence") if self.last_transcription else None
        }


class TextToSpeech:
    """Handles text-to-speech synthesis"""
    
    def __init__(self):
        self.engine = pyttsx3.init()
        self.rate = 150
        self.volume = 1.0
        self.voice_id = 0
        self._configure_engine()
    
    def _configure_engine(self):
        """Configure TTS engine"""
        self.engine.setProperty("rate", self.rate)
        self.engine.setProperty("volume", self.volume)
        self.engine.setProperty("voice", self.engine.getProperty("voices")[self.voice_id].id)
    
    def set_rate(self, rate: int):
        """Set speech rate (words per minute)"""
        self.rate = max(50, min(400, rate))
        self.engine.setProperty("rate", self.rate)
    
    def set_volume(self, volume: float):
        """Set volume (0.0-1.0)"""
        self.volume = max(0.0, min(1.0, volume))
        self.engine.setProperty("volume", self.volume)
    
    def set_voice(self, voice_id: int):
        """Set voice (0=male, 1=female typically)"""
        voices = self.engine.getProperty("voices")
        if 0 <= voice_id < len(voices):
            self.voice_id = voice_id
            self.engine.setProperty("voice", voices[voice_id].id)
    
    def speak(self, text: str, blocking: bool = True):
        """Speak text"""
        self.engine.say(text)
        
        if blocking:
            self.engine.runAndWait()
        else:
            threading.Thread(target=self.engine.runAndWait, daemon=True).start()
    
    def save_to_file(self, text: str, filepath: str) -> bool:
        """Save speech to audio file"""
        try:
            self.engine.save_to_file(text, filepath)
            self.engine.runAndWait()
            return True
        except Exception as e:
            print(f"TTS save error: {e}")
            return False
    
    def get_available_voices(self) -> List[Dict[str, str]]:
        """Get available voices"""
        voices = []
        for i, voice in enumerate(self.engine.getProperty("voices")):
            voices.append({
                "id": i,
                "name": voice.name,
                "language": voice.languages[0] if voice.languages else "unknown"
            })
        return voices


class WakeWordDetector:
    """Detects wake word to activate ONYX"""
    
    def __init__(self, wake_word: str = "onyx", sensitivity: float = 0.7):
        self.wake_word = wake_word.lower()
        self.sensitivity = max(0, min(1, sensitivity))
        self.is_active = False
        self.detect_thread = None
        self.recognizer = SpeechRecognitionManager()
        self.on_wake_callback = None
        self.wake_detected_count = 0
    
    def set_on_wake_callback(self, callback: Callable):
        """Set callback when wake word detected"""
        self.on_wake_callback = callback
    
    def start_detection(self) -> bool:
        """Start wake word detection"""
        if self.is_active:
            return False
        
        self.is_active = True
        self.recognizer.start_listening()
        
        self.detect_thread = threading.Thread(
            target=self._detection_loop,
            daemon=True
        )
        self.detect_thread.start()
        return True
    
    def _detection_loop(self):
        """Background detection loop"""
        while self.is_active:
            result = self.recognizer.get_transcription()
            
            if result:
                text = result.get("text", "").lower()
                confidence = result.get("confidence", 0)
                
                # Check for wake word
                if self.wake_word in text and confidence >= self.sensitivity:
                    self.wake_detected_count += 1
                    
                    if self.on_wake_callback:
                        self.on_wake_callback({
                            "text": text,
                            "confidence": confidence,
                            "timestamp": result.get("timestamp")
                        })
            
            threading.Event().wait(0.1)
    
    def stop_detection(self):
        """Stop wake word detection"""
        self.is_active = False
        self.recognizer.stop_listening()
        if self.detect_thread:
            self.detect_thread.join(timeout=1)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get detection statistics"""
        return {
            "active": self.is_active,
            "wake_word": self.wake_word,
            "sensitivity": self.sensitivity,
            "times_detected": self.wake_detected_count
        }


class AudioManager:
    """Central audio module manager"""
    
    def __init__(self, wake_word: str = "onyx"):
        self.stt = SpeechRecognitionManager()
        self.tts = TextToSpeech()
        self.wake_detector = WakeWordDetector(wake_word)
        self.command_history = []
        self.max_history = 20
    
    def start_listening(self):
        """Start speech recognition"""
        self.stt.start_listening()
    
    def stop_listening(self):
        """Stop speech recognition"""
        self.stt.stop_listening()
    
    def enable_wake_word(self, callback: Optional[Callable] = None) -> bool:
        """Enable wake word detection"""
        if callback:
            self.wake_detector.set_on_wake_callback(callback)
        return self.wake_detector.start_detection()
    
    def disable_wake_word(self):
        """Disable wake word detection"""
        self.wake_detector.stop_detection()
    
    def speak(self, text: str, blocking: bool = True):
        """Synthesize speech"""
        self.tts.speak(text, blocking)
    
    def get_transcription(self) -> Optional[str]:
        """Get latest transcribed text"""
        result = self.stt.get_transcription()
        if result:
            text = result.get("text")
            if text:
                # Store in history
                self.command_history.append({
                    "text": text,
                    "confidence": result.get("confidence"),
                    "timestamp": result.get("timestamp")
                })
                # Keep history size limited
                if len(self.command_history) > self.max_history:
                    self.command_history.pop(0)
            return text
        return None
    
    def get_command_history(self) -> List[Dict]:
        """Get voice command history"""
        return self.command_history
    
    def get_status(self) -> Dict[str, Any]:
        """Get audio system status"""
        return {
            "stt_listening": self.stt.is_listening,
            "wake_word_active": self.wake_detector.is_active,
            "wake_word": self.wake_detector.wake_word,
            "command_history_size": len(self.command_history),
            "wake_word_detections": self.wake_detector.wake_detected_count
        }

# Global instance
audio_manager = AudioManager(wake_word="onyx")
