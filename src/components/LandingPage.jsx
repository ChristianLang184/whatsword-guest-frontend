import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  const handleJoinDemo = () => {
    // Demo session for testing
    navigate('/join/DEMO1234')
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-hero fade-in">
          <div className="logo">🌍</div>
          <h1 className="title">WhatsWord</h1>
          <p className="tagline">Break Language Barriers Instantly</p>
          <p className="description">
            Real-time translation powered by AI.
            <br />
            No app needed. Just scan and talk.
          </p>
        </div>

        <div className="landing-features fade-in">
          <div className="feature">
            <div className="feature-icon">🎤</div>
            <h3>Speak Naturally</h3>
            <p>Just talk - we handle the rest</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Real-time</h3>
            <p>Instant translation as you speak</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Private</h3>
            <p>Your conversations stay yours</p>
          </div>
        </div>

        <div className="landing-cta fade-in">
          <button className="button button-primary" onClick={handleJoinDemo}>
            Try Demo
          </button>
          <p className="cta-hint">
            Or scan a QR code from a host to join a conversation
          </p>
        </div>

        <div className="landing-footer">
          <p>Made with ❤️ for travelers, expats, and global citizens</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
