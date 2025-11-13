import { useState, useEffect } from 'react'
import { useParams, BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import ConversationPage from './components/ConversationPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/:sessionId" element={<ConversationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
