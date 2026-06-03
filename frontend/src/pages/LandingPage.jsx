import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useAuth } from '../hooks/useAuth'
import {
  Sparkles, Brain, Map, BarChart3, Target, ChevronRight,
  Zap, Users, TrendingUp, CheckCircle2, ArrowRight, Star, Mail, Lock
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()
  const { loginWithGoogle, loginDemo, registerWithEmail, loginWithEmail } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/intake')
    }
  }, [isAuthenticated, navigate])

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/intake')
    } else {
      setShowAuth(true)
    }
  }

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    try {
      await loginWithGoogle()
      // Note: for signInWithRedirect, the page will reload before reaching here.
      // Auto-navigation is handled by the useEffect above.
    } catch (e) {
      console.error('Google login failed:', e)
      setAuthLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setAuthLoading(true)
    await loginDemo()
    navigate('/intake')
    setAuthLoading(false)
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      if (isLoginMode) {
        await loginWithEmail(email, password)
      } else {
        await registerWithEmail(email, password)
      }
      navigate('/intake')
    } catch (err) {
      console.error('Email auth failed:', err)
      alert(err.message)
    }
    setAuthLoading(false)
  }

  const features = [
    { icon: Brain, title: 'AI-Powered Matching', desc: 'Claude AI analyses your unique profile to find careers that truly fit your skills, interests, and personality.' },
    { icon: Map, title: 'Step-by-Step Roadmap', desc: 'Get a personalised 4-phase roadmap with specific tasks, resources, and milestones to reach your goal.' },
    { icon: BarChart3, title: 'Real Market Data', desc: 'Salary ranges, growth outlook, and skill demand based on current Indian job market data.' },
  ]

  const steps = [
    { num: '01', title: 'Take Assessment', desc: 'Answer 6 quick questions about your education, skills, and goals', icon: Target },
    { num: '02', title: 'Get Matched', desc: 'AI analyses your profile and finds the top 3 careers for you', icon: Sparkles },
    { num: '03', title: 'Plan Your Path', desc: 'Receive a detailed roadmap with resources and timelines', icon: Map },
    { num: '04', title: 'Track Progress', desc: 'Check in weekly and get adaptive coaching from AI', icon: TrendingUp },
  ]

  const testimonials = [
    { name: 'Priya S.', role: 'B.Tech → Data Analyst', text: 'CareerAI showed me exactly what skills I needed and where to learn them. Landed my dream role in 4 months!', rating: 5 },
    { name: 'Rahul M.', role: 'BCA → Full Stack Dev', text: 'The roadmap was incredibly specific. Not just "learn React" — it told me which course, which project, and when.', rating: 5 },
    { name: 'Ananya K.', role: 'MBA → Product Manager', text: 'I was confused about so many options. The gap analysis showed me my strengths I did not even know I had.', rating: 5 },
  ]

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[100px]" />

        <div className="section-container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6 animate-fade-in">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">Powered by Claude AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-in">
              Find the career{' '}
              <span className="gradient-text">built for you</span>
            </h1>
            <p className="text-lg text-dark-100 mb-10 max-w-xl mx-auto animate-fade-in">
              Answer 6 simple questions. Get AI-powered career matches, personalised roadmaps, and skill gap analysis — all in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button onClick={handleStart} className="btn-primary text-lg !px-8 !py-4 inline-flex items-center justify-center gap-2 group">
                Start Free Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#how-it-works" className="btn-secondary text-lg !px-8 !py-4 inline-flex items-center justify-center gap-2">
                How It Works
              </a>
            </div>
            <p className="text-dark-300 text-sm mt-4">No credit card required • Takes 5 minutes</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything you need to{' '}
              <span className="gradient-text">launch your career</span>
            </h2>
            <p className="text-dark-200 max-w-xl mx-auto">
              Three powerful AI modules work together to give you a complete career strategy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card-hover p-8 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-dark-200 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-dark-800/50">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="glass-card p-6 relative z-10">
                  <div className="text-5xl font-black text-dark-500/50 mb-3">{s.num}</div>
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{s.title}</h3>
                  <p className="text-dark-200 text-sm">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-20">
                    <ChevronRight className="w-6 h-6 text-dark-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Loved by <span className="gradient-text">students & professionals</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-100 text-sm mb-5 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-dark-300 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 to-accent-900/30" />
        <div className="section-container relative text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to find your path?
          </h2>
          <p className="text-dark-100 mb-8 max-w-md mx-auto">
            Join thousands who have discovered their ideal career with AI guidance.
          </p>
          <button onClick={handleStart} className="btn-primary text-lg !px-10 !py-4 inline-flex items-center gap-2 group">
            Start Free Assessment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-dark-400/30">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <span className="font-bold text-white">CareerAI</span>
            </div>
            <p className="text-dark-300 text-sm">© 2026 CareerAI. Built with Claude AI.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAuth(false)}>
          <div className="glass-card p-8 max-w-sm w-full animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Welcome to CareerAI</h3>
            <p className="text-dark-200 text-sm mb-6 text-center">Sign in to start your assessment</p>

            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full btn-secondary !py-3 flex items-center justify-center gap-3 mb-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-400" /></div>
              <div className="relative flex justify-center"><span className="bg-dark-700 px-3 text-dark-300 text-xs">or</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full !pl-10" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full !pl-10" required minLength={6} />
              </div>
              <button type="submit" disabled={authLoading} className="btn-primary w-full">
                {authLoading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div className="text-center mt-3">
              <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-primary-400 text-sm hover:underline">
                {isLoginMode ? 'Need an account? Sign up' : 'Already have an account? Login'}
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-400" /></div>
              <div className="relative flex justify-center"><span className="bg-dark-700 px-3 text-dark-300 text-xs">or try without account</span></div>
            </div>

            <button onClick={handleDemoLogin} disabled={authLoading} className="w-full btn-accent !py-3 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Try Demo Mode
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
