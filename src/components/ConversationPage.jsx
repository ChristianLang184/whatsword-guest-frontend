import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ConversationPage.css'

// WebSocket connection URL (will be configured via env)
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

function ConversationPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  // Connection state
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState(null)
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  
  // Messages
  const [messages, setMessages] = useState([])
  
  // Refs
  const wsRef = useRef(null)
  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  
  // Check Speech Recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setSpeechSupported(true)
      console.log('✅ Speech Recognition API available!')
      
      // Initialize recognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false  // Better for mobile - restart manually
      recognition.interimResults = true
      recognition.lang = 'de-DE' // TODO: Make configurable
      recognition.maxAlternatives = 1
      
      recognition.onstart = () => {
        console.log('🎤 Recognition started')
        setIsListening(true)
      }
      
      recognition.onend = () => {
        console.log('🛑 Recognition ended')
        console.log('Was listening:', isListening)
        setIsListening(false)
      }
      
      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (interimTranscript) {
          setLiveTranscript(interimTranscript)
        }
        
        if (finalTranscript) {
          console.log('📝 Final transcript:', finalTranscript)
          setLiveTranscript('')
          sendMessage(finalTranscript)
          
          // Restart recognition for next input (since continuous = false)
          setTimeout(() => {
            if (recognitionRef.current && !recognitionRef.current.recognizing) {
              try {
                recognitionRef.current.start()
                console.log('🔄 Recognition restarted for next input')
              } catch (err) {
                console.log('Recognition already running or error:', err)
              }
            }
          }, 500)
        }
      }
      
      recognition.onerror = (event) => {
        console.error('❌ Recognition error:', event.error)
        console.error('Error message:', event.message)
        console.error('Error type:', event.type)
        setIsListening(false)
        
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.')
        } else if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, will restart...')
          // Don't restart automatically - let user click again
        } else if (event.error === 'aborted') {
          console.log('⚠️ Recognition aborted')
        } else {
          console.log('⚠️ Unknown error:', event.error)
        }
      }
      
      recognitionRef.current = recognition
    } else {
      console.error('❌ Speech Recognition API not supported')
      setSpeechSupported(false)
      setError('Speech Recognition is not supported in this browser. Please use Chrome or Safari.')
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])
  
  // WebSocket connection
  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setConnecting(false)
      return
    }
    
    console.log('🔌 Connecting to WebSocket...', `${WS_URL}?sessionId=${sessionId}&role=guest`)
    
    const ws = new WebSocket(`${WS_URL}?sessionId=${sessionId}&role=guest`)
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected')
      setConnected(true)
      setConnecting(false)
      setError(null)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Received message:', data)
        
        if (data.type === 'message' || data.type === 'translation') {
          const message = {
            id: Date.now(),
            sender: data.sender,
            originalText: data.originalText || data.text,
            translatedText: data.translatedText,
            timestamp: data.timestamp || new Date().toISOString()
          }
          
          setMessages(prev => [...prev, message])
          
          // Speak translated text if available
          if (message.translatedText && message.sender === 'host') {
            speakText(message.translatedText)
          }
        } else if (data.type === 'host_left') {
          setError('Host has left the conversation')
          setConnected(false)
        }
      } catch (err) {
        console.error('Error parsing message:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      setError('Connection error. Please try again.')
      setConnecting(false)
    }
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected')
      setConnected(false)
      setConnecting(false)
    }
    
    wsRef.current = ws
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [sessionId])
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const sendMessage = (text) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return
    }
    
    const message = {
      type: 'message',
      text,
      language: 'de', // TODO: Make configurable
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 Sending message:', message)
    wsRef.current.send(JSON.stringify(message))
  }
  
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US' // TODO: Make configurable
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }
  
  const stopListening = () => {
    if (!recognitionRef.current) return
    
    // Safari iOS workaround: call start() before stop()
    if (navigator.vendor.indexOf('Apple') > -1) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        // Ignore error if already started
      }
    }
    recognitionRef.current.stop()
  }
  
  const toggleListening = async () => {
    console.log('🎤 Toggle listening clicked')
    
    if (!recognitionRef.current) {
      console.error('❌ Recognition ref is null!')
      alert('Speech Recognition not initialized')
      return
    }
    
    if (isListening) {
      console.log('🛑 Stopping recognition...')
      stopListening()
    } else {
      console.log('▶️ Starting recognition...')
      
      // Two-step permission process for iOS Safari
      try {
        // Step 1: Request microphone permission
        console.log('📱 Step 1: Requesting microphone access...')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('✅ Microphone access granted')
        
        // IMPORTANT: Stop the stream immediately!
        // This allows Speech Recognition to request its own permission
        stream.getTracks().forEach(track => track.stop())
        console.log('🛑 Microphone stream stopped')
        
        // Step 2: Wait a bit, then request Speech Recognition permission
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('🎤 Step 2: Starting speech recognition...')
        recognitionRef.current.start()
        console.log('✅ Recognition start called - waiting for permission popup...')
        
      } catch (err) {
        console.error('❌ Error:', err)
        alert('Please allow microphone access!\n\nTap "Allow" when asked.')
      }
    }
  }
  
  const handleLeave = () => {
    if (recognitionRef.current) {
      stopListening()
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    navigate('/')
  }
  
  // Loading state
  if (connecting) {
    return (
      <div className="conversation-page">
        <div className="conversation-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <h2>Connecting...</h2>
            <p>Session: {sessionId}</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="conversation-page">
        <div className="conversation-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button className="button button-primary" onClick={() => navigate('/')}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="conversation-page">
      <div className="conversation-container">
        {/* Header */}
        <div className="conversation-header">
          <div className="header-left">
            <h1>🌍 WhatsWord</h1>
            <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
          <button className="button button-secondary" onClick={handleLeave}>
            Leave
          </button>
        </div>
        
        {/* Speech Recognition Status */}
        {!speechSupported && (
          <div className="warning-banner">
            ⚠️ Speech Recognition not supported. Please use Chrome or Safari.
          </div>
        )}
        
        {/* Live Transcript */}
        {liveTranscript && (
          <div className="live-transcript slide-up">
            <span className="live-label">Live:</span>
            <span className="live-text">{liveTranscript}</span>
          </div>
        )}
        
        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>👋 Start speaking to begin the conversation</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'guest' ? 'message-guest' : 'message-host'} fade-in`}
              >
                <div className="message-header">
                  <span className="message-sender">
                    {message.sender === 'guest' ? 'You' : 'Host'}
                  </span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  <p className="message-original">{message.originalText}</p>
                  {message.translatedText && (
                    <p className="message-translation">→ {message.translatedText}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Controls */}
        <div className="conversation-controls">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            disabled={!speechSupported || !connected}
          >
            <span className="mic-icon">🎤</span>
            <span className="mic-text">
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConversationPage
