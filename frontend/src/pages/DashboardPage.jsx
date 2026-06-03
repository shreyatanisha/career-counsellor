import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCareerStore } from '../store/careerStore'
import { useUserStore } from '../store/userStore'
import { submitFeedback } from '../api/careerApi'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import {
  LayoutDashboard, Target, Clock, CheckCircle2, Circle,
  ChevronRight, TrendingUp, MessageCircle, X, Send,
  Zap, AlertTriangle, Smile, Meh, Frown, ArrowRight, Star
} from 'lucide-react'

function CheckInModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [mood, setMood] = useState(7)
  const [completed, setCompleted] = useState('')
  const [blockers, setBlockers] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit({
      mood_score: mood,
      completed_actions: completed.split('\n').filter(Boolean),
      blockers: blockers.split('\n').filter(Boolean),
    })
  }

  const moodEmoji = mood >= 8 ? <Smile className="w-8 h-8 text-emerald-400" /> :
                    mood >= 5 ? <Meh className="w-8 h-8 text-amber-400" /> :
                                <Frown className="w-8 h-8 text-red-400" />

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card p-6 max-w-lg w-full animate-bounce-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-400" />
            Weekly Check-In
          </h3>
          <button onClick={onClose} className="text-dark-300 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          {/* Mood */}
          <div>
            <label className="text-sm font-medium text-dark-100 mb-3 block">How are you feeling? (1-10)</label>
            <div className="flex items-center gap-4">
              {moodEmoji}
              <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))}
                className="flex-1 accent-primary-500 h-2" />
              <span className="text-2xl font-bold text-white w-8 text-center">{mood}</span>
            </div>
          </div>

          {/* Completed */}
          <div>
            <label className="text-sm font-medium text-dark-100 mb-2 block">What did you complete this week?</label>
            <textarea value={completed} onChange={e => setCompleted(e.target.value)}
              placeholder="One item per line..." rows={3}
              className="input-field w-full resize-none" />
          </div>

          {/* Blockers */}
          <div>
            <label className="text-sm font-medium text-dark-100 mb-2 block">Any blockers or challenges?</label>
            <textarea value={blockers} onChange={e => setBlockers(e.target.value)}
              placeholder="One item per line..." rows={2}
              className="input-field w-full resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
            {isLoading ? <LoadingSpinner size="sm" /> : <><Send className="w-4 h-4" /> Submit Check-In</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function FeedbackDisplay({ feedback }) {
  if (!feedback) return null

  const modeConfig = {
    REPLAN: { color: 'bg-red-500/10 border-red-500/30 text-red-400', icon: AlertTriangle, label: 'Replanning Needed' },
    NUDGE: { color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: Target, label: 'Keep Pushing' },
    ACCELERATE: { color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: Zap, label: 'Accelerating!' },
  }
  const mode = modeConfig[feedback.mode] || modeConfig.NUDGE

  return (
    <div className={`rounded-2xl border p-5 ${mode.color} animate-slide-up`}>
      <div className="flex items-center gap-2 mb-3">
        <mode.icon className="w-5 h-5" />
        <span className="font-bold">{mode.label}</span>
      </div>
      {feedback.encouragement && <p className="text-sm mb-3 opacity-90">{feedback.encouragement}</p>}
      {feedback.specific_feedback && <p className="text-sm mb-3 opacity-80">{feedback.specific_feedback}</p>}
      {feedback.next_action && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-current/20">
          <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">Next: {feedback.next_action}</p>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { selectedMatch, roadmap } = useCareerStore()
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [completedActions, setCompletedActions] = useState([])

  const milestones = roadmap?.milestones || []
  const currentPhase = roadmap?.current_phase || 0
  const totalActions = milestones.reduce((sum, m) => sum + (m.actions?.length || 0), 0)
  const completionPct = totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 0

  const handleCheckIn = async (data) => {
    setCheckInLoading(true)
    try {
      const res = await submitFeedback(roadmap?.id || 'demo', data.completed_actions, data.mood_score, data.blockers)
      setFeedback(res.data)
      setCompletedActions(prev => [...prev, ...data.completed_actions])
    } catch (err) {
      console.error('Check-in failed:', err)
      // Mock feedback for demo
      const rate = data.mood_score * 10
      setFeedback({
        mode: rate > 80 ? 'ACCELERATE' : rate > 50 ? 'NUDGE' : 'REPLAN',
        encouragement: 'Great job keeping up with your progress! Every step counts.',
        specific_feedback: `Based on your mood score of ${data.mood_score}/10, here is your personalized feedback.`,
        next_action: `Focus on completing the next milestone in ${selectedMatch?.role || 'your career'} path.`,
      })
      setCompletedActions(prev => [...prev, ...data.completed_actions])
    }
    setCheckInLoading(false)
    setShowCheckIn(false)
  }

  const toggleAction = (actionId) => {
    setCompletedActions(prev =>
      prev.includes(actionId) ? prev.filter(a => a !== actionId) : [...prev, actionId]
    )
  }

  if (!roadmap && !selectedMatch) {
    return (
      <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <LayoutDashboard className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Roadmap</h2>
          <p className="text-dark-200 mb-6">Complete an assessment and select a career to start tracking progress.</p>
          <button onClick={() => navigate('/intake')} className="btn-primary inline-flex items-center gap-2">
            Start Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      <div className="section-container py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-dark-200">
            Tracking your journey to <span className="text-primary-400 font-medium">{selectedMatch?.role || roadmap?.target_role}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-sm text-dark-200">Completion</span>
            </div>
            <p className="text-3xl font-bold text-white">{completionPct}%</p>
            <div className="w-full h-1.5 bg-dark-500 rounded-full mt-2">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-dark-200">Current Phase</span>
            </div>
            <p className="text-3xl font-bold text-white">{currentPhase + 1}</p>
            <p className="text-xs text-dark-300 mt-1">of {milestones.length} phases</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-dark-200">Tasks Done</span>
            </div>
            <p className="text-3xl font-bold text-white">{completedActions.length}</p>
            <p className="text-xs text-dark-300 mt-1">of {totalActions} total</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-400" />
              </div>
              <span className="text-sm text-dark-200">Weekly Hours</span>
            </div>
            <p className="text-3xl font-bold text-white">{roadmap?.weekly_commitment_hours || 15}</p>
            <p className="text-xs text-dark-300 mt-1">recommended</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Roadmap Mini View */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-primary-400" />
              Roadmap Progress
            </h2>

            {milestones.map((milestone, i) => (
              <div key={i} className={`glass-card p-4 ${i === currentPhase ? 'border-primary-500/40' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-primary-400 font-medium">{milestone.timeframe}</span>
                    <h3 className="text-white font-bold">{milestone.phase}</h3>
                  </div>
                  {i < currentPhase ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : i === currentPhase ? (
                    <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30">Active</span>
                  ) : (
                    <Circle className="w-5 h-5 text-dark-400" />
                  )}
                </div>

                {i === currentPhase && (
                  <div className="space-y-2 mt-3">
                    {(milestone.actions || []).map((action, j) => {
                      const actionId = `${i}-${j}`
                      const done = completedActions.includes(actionId)
                      return (
                        <button
                          key={j}
                          onClick={() => toggleAction(actionId)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                            done ? 'bg-emerald-500/10' : 'bg-dark-700/50 hover:bg-dark-600/50'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-dark-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${done ? 'text-dark-300 line-through' : 'text-dark-100'}`}>
                            {action.task}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Check-in CTA */}
            <div className="glass-card p-5">
              <h3 className="text-white font-bold mb-2">Weekly Check-In</h3>
              <p className="text-dark-200 text-sm mb-4">Share your progress and get personalised AI coaching feedback.</p>
              <button onClick={() => setShowCheckIn(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Check In Now
              </button>
            </div>

            {/* AI Feedback */}
            {feedback && (
              <div>
                <h3 className="text-white font-bold mb-3">AI Feedback</h3>
                <FeedbackDisplay feedback={feedback} />
              </div>
            )}

            {/* Quick Win */}
            {roadmap?.quick_win && (
              <div className="glass-card p-5 border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-emerald-400 font-bold text-sm">Quick Win</h3>
                </div>
                <p className="text-dark-100 text-sm">{roadmap.quick_win}</p>
              </div>
            )}

            {/* Risk Warning */}
            {roadmap?.biggest_risk && (
              <div className="glass-card p-5 border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-amber-400 font-bold text-sm">Watch Out</h3>
                </div>
                <p className="text-dark-100 text-sm">{roadmap.biggest_risk}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleCheckIn}
        isLoading={checkInLoading}
      />
    </div>
  )
}
