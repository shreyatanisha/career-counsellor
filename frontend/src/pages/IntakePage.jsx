import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIntakeStore } from '../store/intakeStore'
import { useCareerStore } from '../store/careerStore'
import { startIntake, respondToIntake } from '../api/intakeApi'
import { matchCareers } from '../api/careerApi'
import { Send, Bot, User, RefreshCcw, Sparkles } from 'lucide-react'
import LoadingSpinner from '../components/shared/LoadingSpinner'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-primary-400 animate-typing" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 rounded-full bg-primary-400 animate-typing" style={{ animationDelay: '0.2s' }} />
      <div className="w-2 h-2 rounded-full bg-primary-400 animate-typing" style={{ animationDelay: '0.4s' }} />
    </div>
  )
}

function ProgressBar({ current, total = 6 }) {
  const pct = Math.min((current / total) * 100, 100)
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-dark-100">Assessment Progress</span>
        <span className="text-sm font-bold text-primary-400">{current}/{total}</span>
      </div>
      <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function IntakePage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const {
    conversationHistory, currentQuestion, sessionId, isComplete, isLoading, error,
    addMessage, setSessionId, setProfile, incrementQuestion, setLoading, setError
  } = useIntakeStore()
  const { setMatches, setLoadingMatches } = useCareerStore()

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, isLoading])

  // Start intake on mount
  useEffect(() => {
    if (!sessionId && conversationHistory.length === 0) {
      initIntake()
    }
  }, [])

  const initIntake = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await startIntake()
      setSessionId(data.session_id)
      addMessage('assistant', data.message)
      incrementQuestion()
    } catch (err) {
      setError('Failed to start assessment. Please try again.')
      console.error('Intake start failed:', err)
    }
    setLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const msg = input.trim()
    setInput('')
    addMessage('user', msg)
    setLoading(true)
    setError(null)

    try {
      // Build history for API (only role + content)
      const apiHistory = conversationHistory
        .map(m => ({ role: m.role, content: m.content }))
        .concat([{ role: 'user', content: msg }])

      const { data } = await respondToIntake(sessionId, msg, apiHistory)
      addMessage('assistant', data.message)
      incrementQuestion()

      if (data.is_complete && data.profile) {
        setProfile(data.profile)
        // Auto-trigger career matching
        setTimeout(() => handleMatchCareers(data.profile), 1500)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Intake respond failed:', err)
    }
    setLoading(false)
  }

  const handleMatchCareers = async (profile) => {
    setLoadingMatches(true)
    try {
      const { data } = await matchCareers(profile)
      setMatches(data)
      navigate('/results')
    } catch (err) {
      console.error('Career matching failed:', err)
      // Still navigate, matches can be fetched on results page
      navigate('/results')
    }
    setLoadingMatches(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Sanitize assistant message (remove XML tags)
  const cleanMessage = (text) => {
    return text.replace(/<profile>[\s\S]*?<\/profile>/g, '').trim()
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      <div className="section-container py-6 max-w-3xl">
        {/* Progress */}
        <ProgressBar current={currentQuestion} />

        {/* Chat area */}
        <div className="mt-4 glass-card p-0 overflow-hidden" style={{ minHeight: '60vh' }}>
          <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {conversationHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-primary-500/30'
                      : 'bg-gradient-to-br from-primary-500 to-accent-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-primary-300" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{cleanMessage(msg.content)}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai">
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="flex justify-center py-4">
                <div className="glass-card p-5 text-center animate-bounce-in">
                  <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-white font-bold mb-1">Assessment Complete!</p>
                  <p className="text-dark-200 text-sm">Finding your ideal careers...</p>
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center py-2">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <p className="text-red-400 text-sm">{error}</p>
                  <button onClick={initIntake} className="text-red-400 hover:text-red-300 p-1">
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {!isComplete && (
            <div className="border-t border-dark-400/30 p-4">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  className="input-field flex-1"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="btn-primary !px-4 !py-3"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
