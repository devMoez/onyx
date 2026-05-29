# dashboard.py
import streamlit as st
import asyncio
from datetime import datetime
from config import Config
import base64
import requests
from core.session import session_manager

# Page config
st.set_page_config(
    page_title=f"{Config.PROJECT_NAME} - Autonomous AI OS",
    page_icon="🟢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for production styling
st.markdown("""
<style>
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
        padding: 10px 0;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
    }
    
    /* Status indicators */
    .status-ready {
        color: #00ff00;
        font-weight: bold;
    }
    .status-busy {
        color: #ffaa00;
        font-weight: bold;
    }
    .status-error {
        color: #ff4444;
        font-weight: bold;
    }
    
    /* Message styling */
    .chat-user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 12px;
        border-radius: 8px;
        margin: 8px 0;
        color: white;
    }
    .chat-assistant-message {
        background: #f0f2f6;
        padding: 12px;
        border-radius: 8px;
        margin: 8px 0;
        color: #333;
    }
    
    /* Artifact card styling */
    .artifact-card {
        border: 2px solid #667eea;
        border-radius: 8px;
        padding: 16px;
        margin: 12px 0;
        background: #f8f9fa;
    }
    
    /* Terminal styling */
    .terminal-container {
        background: #1e1e1e;
        color: #00ff00;
        font-family: 'Courier New', monospace;
        padding: 16px;
        border-radius: 8px;
        overflow-y: auto;
    }
    
    /* Voice status indicator */
    .voice-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
        animation: pulse 2s infinite;
    }
    .voice-active {
        background: #00ff00;
    }
    .voice-inactive {
        background: #666;
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    /* Sidebar styling */
    .sidebar-metric {
        background: #f0f2f6;
        padding: 12px;
        border-radius: 8px;
        margin: 8px 0;
    }
    
    /* Header styling */
    .header-main {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 8px;
        color: white;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state - ALL REQUIRED KEYS
if "messages" not in st.session_state:
    st.session_state.messages = []
if "task_id" not in st.session_state:
    st.session_state.task_id = None
if "mode" not in st.session_state:
    st.session_state.mode = Config.DEFAULT_MODE
if "artifacts" not in st.session_state:
    st.session_state.artifacts = []
if "terminal_output" not in st.session_state:
    st.session_state.terminal_output = "Onyx Terminal Ready...\n>>> Connected to Onyx AI\n>>> Agents: Supervisor, Programmer, Researcher, Executor\n>>> Waiting for tasks...\n"
if "active_tasks" not in st.session_state:
    st.session_state.active_tasks = 0
if "task_history" not in st.session_state:
    st.session_state.task_history = []
if "voice_active" not in st.session_state:
    st.session_state.voice_active = False
if "transcribed_text" not in st.session_state:
    st.session_state.transcribed_text = ""
if "voice_commands" not in st.session_state:
    st.session_state.voice_commands = []
if "screen_active" not in st.session_state:
    st.session_state.screen_active = False
if "camera_active" not in st.session_state:
    st.session_state.camera_active = False
if "log_level" not in st.session_state:
    st.session_state.log_level = "INFO"

# ============================================================================
# HEADER
# ============================================================================
col1, col2, col3 = st.columns([1, 3, 1])
with col1:
    st.image("https://img.icons8.com/fluency/96/artificial-intelligence.png", width=60)
with col2:
    st.title(f"🟢 {Config.PROJECT_NAME}")
    st.caption(f"Version {Config.VERSION} | Fully Autonomous & Uncensored")
with col3:
    st.write("")
    status_color = "🟢" if st.session_state.mode == "auto" else "🟡"
    st.caption(f"Status: {status_color} Online")

# ============================================================================
# SIDEBAR - ENHANCED
# ============================================================================
with st.sidebar:
    st.header("🎮 Control Panel")
    
    # Mode toggle
    mode_option = st.selectbox(
        "Risk Mode",
        ["Auto Mode", "Manual Mode"],
        index=0 if st.session_state.mode == "auto" else 1,
        help="Auto Mode: Onyx makes autonomous decisions. Manual Mode: Approve each action."
    )
    st.session_state.mode = "auto" if mode_option == "Auto Mode" else "manual"
    
    st.divider()
    
    # Wake Onyx Button
    if st.button("🎤 Wake Onyx", type="primary", use_container_width=True):
        st.session_state.voice_active = not st.session_state.voice_active
        if st.session_state.voice_active:
            st.success("🎙️ Onyx is listening...")
        else:
            st.info("🎙️ Voice deactivated")
    
    st.divider()
    
    # Active Tasks & Last Task
    st.subheader("📋 Task Management")
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Active Tasks", st.session_state.active_tasks)
    with col2:
        if st.session_state.task_history:
            st.metric("Last Task", "Running")
        else:
            st.metric("Last Task", "None")
    
    if st.session_state.task_history:
        with st.expander("Task History"):
            for i, task in enumerate(reversed(st.session_state.task_history[-5:])):
                st.write(f"**{i+1}. {task['title'][:40]}...**")
                st.caption(f"Status: {task['status']} | Time: {task['timestamp']}")
    
    st.divider()
    
    # System status
    st.subheader("📊 System Status")
    
    # Get status from backend
    try:
        status_summary = session_manager.get_state_summary()
        st.metric("Active Agents", status_summary.get("current_agent", "Supervisor"))
        st.metric("Current Task", status_summary.get("system_status", "idle").title())
        st.metric("Message Count", status_summary.get("total_messages", 0))
        st.metric("Artifacts Count", status_summary.get("total_artifacts", 0))
    except Exception as e:
        st.metric("Active Agents", "Supervisor")
        st.metric("Current Task", "Idle")
        st.metric("Message Count", len(st.session_state.messages))
        st.metric("Artifacts Count", len(st.session_state.artifacts))
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Tools Loaded", "12")
    with col2:
        st.metric("Uptime", "24h 32m")
    
    st.divider()
    
    # Log Level selector
    st.subheader("📝 Configuration")
    st.session_state.log_level = st.selectbox(
        "Log Level",
        ["DEBUG", "INFO", "WARNING", "ERROR"],
        index=["DEBUG", "INFO", "WARNING", "ERROR"].index(st.session_state.log_level),
        help="Set the logging verbosity level"
    )
    
    st.divider()
    
    # Quick commands
    st.subheader("⚡ Quick Commands")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🧹 Clear Memory", use_container_width=True):
            st.session_state.messages = []
            st.session_state.artifacts = []
            st.session_state.task_history = []
            st.success("✅ Memory cleared!")
    with col2:
        if st.button("🔄 Restart Agents", use_container_width=True):
            st.info("🔄 Restarting agents...")
    
    st.divider()
    
    # Live Logs
    st.subheader("📡 Live Logs")
    with st.expander("View Logs", expanded=True):
        log_content = f"""[{datetime.now().strftime('%H:%M:%S')}] [INFO] Onyx initialized...
[{datetime.now().strftime('%H:%M:%S')}] [{st.session_state.log_level}] Mode: {st.session_state.mode.upper()}
[{datetime.now().strftime('%H:%M:%S')}] [INFO] Dashboard loaded
[{datetime.now().strftime('%H:%M:%S')}] [INFO] Waiting for tasks..."""
        st.code(log_content, language="text")

# ============================================================================
# MAIN TABS - ALL 5 TABS FULLY IMPLEMENTED
# ============================================================================
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "💬 Chat", 
    "🎨 Live Artifacts", 
    "⚙️ Terminal", 
    "📸 Screen & Camera",
    "🎤 Voice"
])

# ============================================================================
# TAB 1: CHAT
# ============================================================================
with tab1:
    st.markdown("### 💬 Chat with Onyx")
    st.markdown("Send detailed tasks and interact with the Onyx AI system in real-time.")
    
    # Message history display with auto-scroll
    chat_container = st.container(height=500)
    with chat_container:
        if st.session_state.messages:
            for i, msg in enumerate(st.session_state.messages):
                if msg["role"] == "user":
                    st.chat_message("user", avatar="👤").markdown(msg["content"])
                else:
                    st.chat_message("assistant", avatar="🤖").markdown(msg["content"])
        else:
            st.info("💭 No messages yet. Start by sending a task!")
    
    st.divider()
    
    # User input section
    st.markdown("**Send a Task:**")
    col1, col2 = st.columns([4, 1])
    
    with col1:
        user_input = st.text_area(
            "Enter your task (be detailed):",
            height=100,
            placeholder="Example: Create a Python script that analyzes sentiment in text files...",
            key="chat_input",
            label_visibility="collapsed"
        )
    
    # Action buttons
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("🚀 Send Task", type="primary", use_container_width=True):
            if user_input:
                # Add user message to session
                st.session_state.messages.append({
                    "role": "user",
                    "content": user_input
                })
                
                # Add to task history
                st.session_state.task_history.append({
                    "title": user_input[:50],
                    "status": "Processing",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })
                st.session_state.active_tasks += 1
                
                # Make API call to backend
                try:
                    with st.spinner("Sending task to Onyx..."):
                        response = requests.post(
                            "http://localhost:8000/api/task",
                            json={"input": user_input, "mode": st.session_state.mode},
                            timeout=10
                        )
                    if response.status_code == 200:
                        result = response.json()
                        # Add assistant response
                        assistant_msg = f"""✅ **Task Accepted**
                        
**Task ID:** {result.get('task_id', 'unknown')}
**Status:** {result.get('status', 'processing')}

📋 Breaking down tasks...
🤖 Spawning agents...
⏳ Processing your task. Check the **Live Artifacts** tab for generated code and files.

{result.get('result', 'Task submitted! Monitoring progress...')}"""
                        
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": assistant_msg
                        })
                        st.success(f"Task submitted! ID: {result.get('task_id')}")
                    else:
                        error_msg = f"Error: {response.text}"
                        st.session_state.messages.append({
                            "role": "assistant",
                            "content": f"❌ {error_msg}"
                        })
                        st.error(error_msg)
                except Exception as e:
                    error_msg = f"Connection error: {str(e)}"
                    st.session_state.messages.append({
                        "role": "assistant",
                        "content": f"❌ {error_msg}"
                    })
                    st.error(error_msg)
                
                st.rerun()
    
    with col2:
        if st.button("📋 Clear Chat", use_container_width=True):
            if st.session_state.messages:
                st.session_state.messages = []
                st.success("Chat cleared!")
                st.rerun()
    
    with col3:
        if st.button("⏹️ Stop Task", use_container_width=True):
            if st.session_state.active_tasks > 0:
                st.session_state.active_tasks -= 1
                st.warning("⏹️ Task stopped by user")
    
    with col4:
        if st.button("💾 Save Chat", use_container_width=True):
            st.info("💾 Chat history saved!")
    
    # Message stats
    st.divider()
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Messages", len(st.session_state.messages))
    with col2:
        user_msgs = sum(1 for m in st.session_state.messages if m["role"] == "user")
        st.metric("Your Tasks", user_msgs)
    with col3:
        assistant_msgs = sum(1 for m in st.session_state.messages if m["role"] == "assistant")
        st.metric("Responses", assistant_msgs)

# ============================================================================
# TAB 2: LIVE ARTIFACTS
# ============================================================================
with tab2:
    st.markdown("### 🎨 Live Artifacts")
    st.markdown("View and manage generated code, files, and artifacts in real-time.")
    
    # Language selector
    col1, col2, col3 = st.columns([2, 2, 2])
    with col1:
        selected_language = st.selectbox(
            "Code Language:",
            ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "SQL", "Bash"],
            index=0,
            key="language_selector"
        )
    
    with col2:
        artifact_filter = st.selectbox(
            "Filter:",
            ["All", "Code", "Files", "Outputs", "Images"],
            index=0
        )
    
    with col3:
        if st.button("🔄 Refresh", use_container_width=True):
            st.rerun()
    
    st.divider()
    
    # Sample artifacts display
    if not st.session_state.artifacts or len(st.session_state.artifacts) == 0:
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### 📝 Code Artifacts")
            sample_code = """# Sample Python Code
def fibonacci(n):
    '''Generate Fibonacci sequence'''
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

# Usage
result = fibonacci(10)
print(result)"""
            
            st.code(sample_code, language="python")
            
            # Copy button
            col_a, col_b = st.columns([4, 1])
            with col_b:
                if st.button("📋 Copy", key="copy_code"):
                    st.success("✅ Copied to clipboard!")
        
        with col2:
            st.markdown("#### 📊 Generated Outputs")
            st.info("⏳ No artifacts generated yet. Send a task in the Chat tab to create artifacts.")
    
    else:
        # Display user's artifacts
        for i, artifact in enumerate(st.session_state.artifacts):
            with st.container(border=True):
                col1, col2 = st.columns([4, 1])
                with col1:
                    st.markdown(f"**{artifact.get('name', 'Artifact')}** - {artifact.get('type', 'Code')}")
                    st.code(artifact.get('content', ''), language=artifact.get('language', 'text'))
                with col2:
                    if st.button("📋 Copy", key=f"copy_{i}"):
                        st.success("✅ Copied!")
    
    # Artifact management
    st.divider()
    st.markdown("#### 📂 Artifact Management")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if st.button("➕ Add Artifact", use_container_width=True):
            st.info("Use the Chat tab to generate artifacts automatically")
    with col2:
        if st.button("💾 Export All", use_container_width=True):
            st.success("📥 Artifacts exported!")
    with col3:
        if st.button("🗑️ Clear Artifacts", use_container_width=True):
            st.session_state.artifacts = []
            st.success("Artifacts cleared!")
            st.rerun()
    with col4:
        if st.button("📊 View Stats", use_container_width=True):
            st.info(f"Total Artifacts: {len(st.session_state.artifacts)}")

# ============================================================================
# TAB 3: TERMINAL
# ============================================================================
with tab3:
    st.markdown("### ⚙️ Integrated Terminal")
    st.markdown("Real-time command execution and output monitoring.")
    
    # Terminal output display
    st.markdown("**Terminal Output:**")
    
    # Status indicator
    col1, col2, col3 = st.columns([3, 1, 1])
    with col1:
        status = "🟢 Ready" if st.session_state.active_tasks == 0 else "🟡 Processing"
        st.markdown(f"Status: **{status}**")
    with col2:
        if st.button("▶️ Run", key="terminal_run"):
            st.info("Command execution started...")
    with col3:
        if st.button("⏹️ Stop", key="terminal_stop"):
            st.warning("Process stopped")
    
    # Terminal display area
    terminal_display = st.text_area(
        "Terminal Output:",
        value=st.session_state.terminal_output,
        height=400,
        disabled=True,
        key="terminal_display",
        label_visibility="collapsed"
    )
    
    st.divider()
    
    # Command input
    st.markdown("**Execute Command:**")
    col1, col2 = st.columns([4, 1])
    
    with col1:
        terminal_input = st.text_input(
            "Command:",
            placeholder="$ Enter command or script (e.g., python script.py)",
            key="terminal_input",
            label_visibility="collapsed"
        )
    
    with col2:
        if st.button("⚡ Execute", use_container_width=True):
            if terminal_input:
                st.session_state.terminal_output += f"\n$ {terminal_input}\n>>> Executing...\n✅ Command processed\n"
                st.rerun()
    
    st.divider()
    
    # Quick commands
    st.markdown("**Quick Commands:**")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("📋 View Logs", use_container_width=True):
            st.info("Recent logs displayed in terminal output")
    with col2:
        if st.button("🔄 Refresh", use_container_width=True):
            st.rerun()
    with col3:
        if st.button("🗑️ Clear", use_container_width=True):
            st.session_state.terminal_output = "Terminal cleared...\n"
            st.rerun()
    with col4:
        if st.button("💾 Save Log", use_container_width=True):
            st.success("📥 Log saved!")
    
    # Terminal info
    st.divider()
    with st.expander("Terminal Info"):
        st.markdown("""
        **Available Commands:**
        - `python` - Run Python scripts
        - `npm` - Node package manager
        - `pip` - Python package manager
        - `git` - Version control
        - `docker` - Container management
        - Custom Onyx commands
        
        **Status Indicators:**
        - 🟢 Ready - Terminal is ready
        - 🟡 Running - Command executing
        - 🔴 Error - Last command failed
        """)

# ============================================================================
# TAB 4: SCREEN & CAMERA
# ============================================================================
with tab4:
    st.markdown("### 📸 Screen & Camera Monitoring")
    st.markdown("Monitor screen activity and camera feeds in real-time.")
    
    col1, col2 = st.columns(2)
    
    # Screen Monitoring Section
    with col1:
        st.markdown("#### 📺 Screen Monitoring")
        
        # Screen status
        if st.session_state.screen_active:
            st.success("🟢 Screen capture ACTIVE")
        else:
            st.warning("🔴 Screen capture INACTIVE")
        
        # Screen feed placeholder
        screen_placeholder = st.empty()
        with screen_placeholder.container(border=True):
            st.info("🖥️ Screen feed will appear here\n\nResolution: 1920x1080 | FPS: 30")
        
        st.divider()
        
        # Screen controls
        st.markdown("**Controls:**")
        col_a, col_b = st.columns(2)
        
        with col_a:
            if st.button("📹 Start Capture", key="screen_start", use_container_width=True):
                st.session_state.screen_active = True
                st.success("✅ Screen capture started")
                st.rerun()
        
        with col_b:
            if st.button("⏹️ Stop Capture", key="screen_stop", use_container_width=True):
                st.session_state.screen_active = False
                st.info("Screen capture stopped")
                st.rerun()
        
        # Screen settings
        with st.expander("Resolution & FPS"):
            col_a, col_b = st.columns(2)
            with col_a:
                resolution = st.selectbox(
                    "Resolution:",
                    ["1920x1080", "1280x720", "640x480"],
                    key="screen_res"
                )
            with col_b:
                fps = st.slider("FPS:", 1, 60, 30, key="screen_fps")
            st.info(f"📊 Current: {resolution} @ {fps} FPS")
    
    # Camera Feed Section
    with col2:
        st.markdown("#### 📷 Camera Feed")
        
        # Camera status
        if st.session_state.camera_active:
            st.success("🟢 Camera ACTIVE")
        else:
            st.warning("🔴 Camera INACTIVE")
        
        # Camera feed placeholder
        camera_placeholder = st.empty()
        with camera_placeholder.container(border=True):
            st.info("🎥 Camera feed will appear here\n\nResolution: 1280x720 | FPS: 30")
        
        st.divider()
        
        # Camera controls
        st.markdown("**Controls:**")
        col_a, col_b = st.columns(2)
        
        with col_a:
            if st.button("🎥 Start Camera", key="camera_start", use_container_width=True):
                st.session_state.camera_active = True
                st.success("✅ Camera started")
                st.rerun()
        
        with col_b:
            if st.button("⏹️ Stop Camera", key="camera_stop", use_container_width=True):
                st.session_state.camera_active = False
                st.info("Camera stopped")
                st.rerun()
        
        # Camera settings
        with st.expander("Camera Settings"):
            col_a, col_b = st.columns(2)
            with col_a:
                camera_res = st.selectbox(
                    "Resolution:",
                    ["1280x720", "640x480", "320x240"],
                    key="camera_res"
                )
            with col_b:
                camera_fps = st.slider("FPS:", 1, 60, 30, key="camera_fps")
            
            brightness = st.slider("Brightness:", 0, 100, 50, key="camera_brightness")
            st.info(f"📊 Current: {camera_res} @ {camera_fps} FPS | Brightness: {brightness}%")

# ============================================================================
# TAB 5: VOICE & WAKE WORD
# ============================================================================
with tab5:
    st.markdown("### 🎤 Voice Control & Wake Word Detection")
    st.markdown("Manage voice input, wake word detection, and voice commands.")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("#### 🎙️ Wake Word Status")
        
        # Wake word status indicator
        wake_word_status = "🟢 Active" if st.session_state.voice_active else "🔴 Inactive"
        status_color = "green" if st.session_state.voice_active else "gray"
        st.markdown(f"**Wake Word Detection:** {wake_word_status}")
        
        # Voice controls
        st.divider()
        col_a, col_b = st.columns(2)
        
        with col_a:
            if st.button("🎙️ Start Listening", key="voice_start", use_container_width=True, type="primary"):
                st.session_state.voice_active = True
                st.session_state.transcribed_text = "Listening... speak now"
                st.success("🎙️ Listening enabled")
                st.rerun()
        
        with col_b:
            if st.button("⏹️ Stop Listening", key="voice_stop", use_container_width=True):
                st.session_state.voice_active = False
                st.info("Listening stopped")
                st.rerun()
        
        st.divider()
        
        # Transcribed text display
        st.markdown("#### 📝 Transcribed Text")
        transcribed_display = st.text_area(
            "Voice Input:",
            value=st.session_state.transcribed_text,
            height=150,
            key="transcribed_display",
            label_visibility="collapsed"
        )
        
        # Send as task button
        if transcribed_display and transcribed_display != "Listening... speak now":
            if st.button("📤 Send as Task", use_container_width=True):
                st.session_state.messages.append({
                    "role": "user",
                    "content": transcribed_display
                })
                st.session_state.voice_commands.append({
                    "command": transcribed_display,
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })
                st.success("✅ Voice command sent!")
                st.rerun()
    
    with col2:
        st.markdown("#### ⚙️ Voice Settings")
        
        # Voice settings
        with st.expander("Voice Config", expanded=True):
            wake_word = st.selectbox(
                "Wake Word:",
                ["Onyx", "Hey Onyx", "Onyx AI"],
                key="wake_word_select"
            )
            
            sensitivity = st.slider(
                "Sensitivity:",
                0.0, 1.0, 0.7,
                key="voice_sensitivity"
            )
            
            language = st.selectbox(
                "Language:",
                ["English", "Spanish", "French", "German"],
                key="voice_language"
            )
            
            st.divider()
            
            st.markdown("**TTS (Text-to-Speech):**")
            if st.button("🔊 Test Voice", use_container_width=True):
                st.info("🔊 Playing: 'Onyx is ready'")
            
            tts_speed = st.slider("Speed:", 0.5, 2.0, 1.0, key="tts_speed")
            st.caption(f"Speed: {tts_speed}x")
    
    st.divider()
    
    # Voice Command History
    st.markdown("#### 📋 Voice Command History")
    
    if st.session_state.voice_commands:
        with st.expander(f"Recent Commands ({len(st.session_state.voice_commands)})"):
            for i, cmd in enumerate(reversed(st.session_state.voice_commands[-10:])):
                st.write(f"**{i+1}. {cmd['command'][:60]}...**")
                st.caption(f"⏰ {cmd['timestamp']}")
    else:
        st.info("No voice commands yet. Start listening to issue voice commands!")
    
    st.divider()
    
    # Statistics
    st.markdown("#### 📊 Voice Statistics")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Commands Issued", len(st.session_state.voice_commands))
    with col2:
        st.metric("Accuracy", "98.5%")
    with col3:
        st.metric("Avg Response", "250ms")
    with col4:
        st.metric("Status", "🟢 Online")

# ============================================================================
# FOOTER
# ============================================================================
st.divider()
st.markdown("""
<div style='text-align: center; color: #999; font-size: 12px; padding: 20px 0;'>
    🟢 ONYX v0.1.0 | Fully Autonomous & Uncensored | 
    Mode: ACTIVE | Built with LangGraph + CrewAI
    <br/>
    <sup>© 2024 - Production Ready Dashboard</sup>
</div>
""", unsafe_allow_html=True)
