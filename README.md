# WhatsWord Guest Frontend

Browser-based guest interface for WhatsWord real-time translation.

## Features

- 🎤 **Speech Recognition** - Browser-based speech-to-text
- 🌐 **WebSocket Connection** - Real-time message relay
- 🔊 **Text-to-Speech** - Automatic speech output
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast & Lightweight** - Built with Vite + React

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Web Speech API** - Speech recognition & synthesis
- **WebSocket** - Real-time communication
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on `http://localhost:3001`

### Build

```bash
npm run build
```

Outputs to `dist/` folder

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_WS_URL=ws://localhost:3000
VITE_GUEST_URL=http://localhost:3001
```

For production, update to your deployed URLs.

## Browser Compatibility

### Speech Recognition

- ✅ Chrome/Edge (Chromium)
- ✅ Safari 14.1+
- ❌ Firefox (not supported)

### Requirements

- **HTTPS required** for Speech Recognition API
- Microphone permission needed

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Manual

1. Build: `npm run build`
2. Upload `dist/` folder to any static host

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx       # Home page
│   ├── LandingPage.css
│   ├── ConversationPage.jsx  # Main conversation UI
│   └── ConversationPage.css
├── App.jsx                    # Router setup
├── App.css
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## Usage Flow

1. Host creates session in mobile app
2. Host shows QR code
3. Guest scans QR code
4. Browser opens to `/join/{sessionId}`
5. WebSocket connects to Cloud Bridge
6. Real-time translation begins!

## API Integration

Connects to WhatsWord Cloud Bridge via WebSocket:

```javascript
const ws = new WebSocket(`${WS_URL}?sessionId=${sessionId}&role=guest`)
```

Message format:

```javascript
{
  type: 'message',
  text: 'Hello',
  language: 'en',
  timestamp: '2025-01-01T00:00:00.000Z'
}
```

## License

Proprietary - WhatsWord

## Support

For issues or questions, contact: support@whatsword.com
