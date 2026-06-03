import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIntakeStore } from '../store/intakeStore'
import { useCareerStore } from '../store/careerStore'
import { matchCareers, generateRoadmap, analyseGaps } from '../api/careerApi'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import {
  Trophy, TrendingUp, Clock, IndianRupee, ChevronDown, ChevronUp,
  CheckCircle2, Circle, ExternalLink, Target, Sparkles, ArrowRight,
  AlertTriangle, BookOpen, Star, Zap
} from 'lucide-react'

function FitScoreRing({ score }) {
  const r = 36, c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#373a40" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-dark-300">FIT</span>
      </div>
    </div>
  )
}

function CareerMatchCard({ match, isSelected, onSelect }) {
  const growth = {
    High: { color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30', icon: TrendingUp },
    Medium: { color: 'text-amber-400 bg-amber-500/20 border-amber-500/30', icon: Target },
    Low: { color: 'text-red-400 bg-red-500/20 border-red-500/30', icon: AlertTriangle },
  }
  const g = growth[match.growth_outlook] || growth.Medium
  const salaryMin = (match.salary_range_inr?.min || 0) / 100000
  const salaryMax = (match.salary_range_inr?.max || 0) / 100000

  return (
    <div
      onClick={onSelect}
      className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
        isSelected ? 'border-primary-500/60 shadow-lg shadow-primary-500/20' : 'hover:border-dark-300/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded-full">
              #{match.rank}
            </span>
            <div className={`badge text-[10px] ${g.color} border`}>
              <g.icon className="w-3 h-3 mr-1" />{match.growth_outlook}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">{match.role}</h3>
        </div>
        <FitScoreRing score={match.fit_score} />
      </div>

      <p className="text-dark-200 text-sm mb-4 line-clamp-2">{match.why_matched}</p>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <IndianRupee className="w-4 h-4 text-dark-300" />
        <span className="text-dark-100 font-medium">₹{salaryMin}L – ₹{salaryMax}L/yr</span>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <Clock className="w-4 h-4 text-dark-300" />
        <span className="text-dark-200">Job-ready in: <span className="text-white font-medium">{match.time_to_job_ready}</span></span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-dark-300 uppercase tracking-wider">Skills You Have</p>
        <div className="flex flex-wrap gap-1.5">
          {(match.user_has || []).slice(0, 5).map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{s}</span>
          ))}
        </div>
        <p className="text-xs font-medium text-dark-300 uppercase tracking-wider mt-2">Skills to Learn</p>
        <div className="flex flex-wrap gap-1.5">
          {(match.user_lacks || []).slice(0, 5).map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">{s}</span>
          ))}
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-dark-400/30 flex items-center justify-center gap-2 text-primary-400 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Selected — Building your roadmap
        </div>
      )}
    </div>
  )
}

function RoadmapTimeline({ roadmap }) {
  const [expandedPhase, setExpandedPhase] = useState(0)

  if (!roadmap) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-primary-400" />
          Your Roadmap
        </h2>
        <div className="flex items-center gap-4 text-sm text-dark-200">
          <span>⏱ {roadmap.total_duration}</span>
          <span>📅 {roadmap.weekly_commitment_hours}h/week</span>
        </div>
      </div>

      {roadmap.quick_win && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-400">Quick Win</p>
            <p className="text-sm text-dark-100">{roadmap.quick_win}</p>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-dark-500" />

        {(roadmap.milestones || []).map((milestone, i) => (
          <div key={i} className="relative pl-14 pb-6">
            {/* Dot */}
            <div className={`absolute left-3.5 w-3.5 h-3.5 rounded-full border-2 ${
              i <= (roadmap.current_phase || 0)
                ? 'bg-primary-500 border-primary-400'
                : 'bg-dark-600 border-dark-400'
            }`} />

            <div className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedPhase(expandedPhase === i ? -1 : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm text-primary-400 font-medium">{milestone.timeframe}</p>
                  <p className="text-white font-bold">{milestone.phase}</p>
                  <p className="text-dark-200 text-sm">{milestone.goal}</p>
                </div>
                {expandedPhase === i ? <ChevronUp className="w-5 h-5 text-dark-300" /> : <ChevronDown className="w-5 h-5 text-dark-300" />}
              </button>

              {expandedPhase === i && (
                <div className="border-t border-dark-400/30 p-4 space-y-3 animate-slide-up">
                  {(milestone.actions || []).map((action, j) => (
                    <div key={j} className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-xl">
                      <Circle className="w-4 h-4 text-dark-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{action.task}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs">
                          {action.resource_free && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <BookOpen className="w-3 h-3" />Free: {action.resource_free}
                            </span>
                          )}
                          {action.resource_paid && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <ExternalLink className="w-3 h-3" />Paid: {action.resource_paid}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {milestone.checkpoint && (
                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3 text-sm">
                      <span className="text-primary-400 font-medium">Checkpoint:</span>{' '}
                      <span className="text-dark-100">{milestone.checkpoint}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GapAnalysisTable({ gaps }) {
  if (!gaps) return null

  const priorityStyle = {
    CRITICAL: 'badge-critical',
    IMPORTANT: 'badge-important',
    'NICE-TO-HAVE': 'badge-nice',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Target className="w-5 h-5 text-accent-400" />
        Skill Gap Analysis
      </h2>

      <div className="flex items-center gap-6 text-sm text-dark-200">
        <span>Total Hours: <strong className="text-white">{gaps.total_gap_hours}h</strong></span>
        {gaps.fastest_path && <span>Fastest Path: <strong className="text-white">{gaps.fastest_path}</strong></span>}
      </div>

      <div className="space-y-3">
        {(gaps.gaps || []).map((gap, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-bold">{gap.skill}</h4>
                <p className="text-dark-200 text-xs mt-0.5">{gap.why_needed}</p>
              </div>
              <span className={priorityStyle[gap.priority] || 'badge'}>{gap.priority}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <span className="text-dark-300">Current:</span>{' '}
                <span className="text-dark-100">{gap.current_level}</span>
              </div>
              <div>
                <span className="text-dark-300">Target:</span>{' '}
                <span className="text-dark-100">{gap.target_level}</span>
              </div>
              <div>
                <span className="text-dark-300">Hours:</span>{' '}
                <span className="text-white font-medium">{gap.estimated_hours}h</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {gap.learn_free && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                  <p className="text-emerald-400 font-medium mb-1">🆓 Free Resource</p>
                  <p className="text-dark-100">{gap.learn_free.name}</p>
                  <p className="text-dark-300">{gap.learn_free.duration}</p>
                </div>
              )}
              {gap.learn_paid && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  <p className="text-amber-400 font-medium mb-1">💰 Paid Resource</p>
                  <p className="text-dark-100">{gap.learn_paid.name}</p>
                  <p className="text-dark-300">{gap.learn_paid.platform} • ₹{gap.learn_paid.cost_inr}</p>
                </div>
              )}
            </div>

            {gap.practice_project && (
              <div className="mt-2 bg-primary-500/10 border border-primary-500/20 rounded-lg p-2.5 text-xs">
                <span className="text-primary-400 font-medium">🔨 Practice Project:</span>{' '}
                <span className="text-dark-100">{gap.practice_project}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { profile } = useIntakeStore()
  const {
    matches, selectedMatch, roadmap, gapAnalysis,
    setMatches, selectMatch, setRoadmap, setGapAnalysis,
    isLoadingMatches, isLoadingRoadmap, isLoadingGaps,
    setLoadingMatches, setLoadingRoadmap, setLoadingGaps
  } = useCareerStore()

  const [localRoadmap, setLocalRoadmap] = useState(null)
  const [localGaps, setLocalGaps] = useState(null)

  // If no matches yet and we have profile, trigger matching
  useEffect(() => {
    if (matches.length === 0 && profile) {
      fetchMatches()
    }
  }, [])

  const fetchMatches = async () => {
    if (!profile) return
    setLoadingMatches(true)
    try {
      const { data } = await matchCareers(profile)
      setMatches(data)
    } catch (err) {
      console.error('Failed to fetch matches:', err)
    }
    setLoadingMatches(false)
  }

  const handleSelectCareer = async (match) => {
    selectMatch(match)
    
    // Generate roadmap and gap analysis
    setLoadingRoadmap(true)
    setLoadingGaps(true)

    try {
      // Use profile data for generation (mock with match data since we may not have DB IDs)
      const profileData = profile || {}
      const careerData = match

      // Call roadmap generation
      const roadmapPromise = generateRoadmap(
        profileData.profile_id,
        match.id
      ).then(res => {
        setRoadmap(res.data)
        setLocalRoadmap(res.data)
      }).catch(err => {
        console.error('Roadmap generation failed:', err)
        alert('Failed to generate your personalized roadmap. Note: API might be out of credits or hit its limit.')
        setRoadmap(null)
        setLocalRoadmap(null)
      }).finally(() => setLoadingRoadmap(false))

      // Call gap analysis
      const gapPromise = analyseGaps(
        profileData.profile_id,
        match.id
      ).then(res => {
        setGapAnalysis(res.data)
        setLocalGaps(res.data)
      }).catch(err => {
        console.error('Gap analysis failed:', err)
        setGapAnalysis(null)
        setLocalGaps(null)
      }).finally(() => setLoadingGaps(false))

      await Promise.all([roadmapPromise, gapPromise])
    } catch (err) {
      console.error('Error generating results:', err)
    }
  }

  const displayRoadmap = localRoadmap || roadmap
  const displayGaps = localGaps || gapAnalysis

  if (isLoadingMatches) {
    return (
      <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Finding your ideal careers..." />
        </div>
      </div>
    )
  }

  if (matches.length === 0 && !profile) {
    return (
      <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <Sparkles className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Results Yet</h2>
          <p className="text-dark-200 mb-6">Complete the assessment first to get your career matches.</p>
          <button onClick={() => navigate('/intake')} className="btn-primary inline-flex items-center gap-2">
            Take Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      <div className="section-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Career <span className="gradient-text">Matches</span>
          </h1>
          <p className="text-dark-200">Select a career to see your personalised roadmap and gap analysis</p>
        </div>

        {/* Career Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {matches.map((match, i) => (
            <CareerMatchCard
              key={i}
              match={match}
              isSelected={selectedMatch?.role === match.role}
              onSelect={() => handleSelectCareer(match)}
            />
          ))}
        </div>

        {/* Roadmap & Gap Analysis */}
        {selectedMatch && (
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            <div>
              {isLoadingRoadmap ? (
                <div className="glass-card p-12 flex items-center justify-center">
                  <LoadingSpinner size="lg" text="Generating your roadmap..." />
                </div>
              ) : (
                <RoadmapTimeline roadmap={displayRoadmap} />
              )}
            </div>
            <div>
              {isLoadingGaps ? (
                <div className="glass-card p-12 flex items-center justify-center">
                  <LoadingSpinner size="lg" text="Analysing skill gaps..." />
                </div>
              ) : (
                <GapAnalysisTable gaps={displayGaps} />
              )}
            </div>
          </div>
        )}

        {/* Navigate to Dashboard */}
        {selectedMatch && displayRoadmap && (
          <div className="mt-10 text-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2 group">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
