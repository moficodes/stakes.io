import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Plus, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateStake from './pages/CreateStake';
import Feed from './pages/Feed';
import { cn } from './lib/utils';

function Navigation() {
  const { user, signIn, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Feed', path: '/feed', icon: Users },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-rose-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-rose-600/20">
              <Flame size={22} className="fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">Stakes.io</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-xs font-bold uppercase tracking-widest transition-colors hover:text-rose-500",
                  location.pathname === item.path ? "text-rose-500" : "text-zinc-500"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/create">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-zinc-100 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-white/5"
                  >
                    <Plus size={18} />
                    <span>New Stake</span>
                  </motion.button>
                </Link>
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-rose-500 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={signIn}
                className="bg-rose-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="pt-24 pb-12 px-4 max-w-7xl mx-auto w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-600 selection:text-white">
          <Navigation />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateStake />} />
              <Route path="/feed" element={<Feed />} />
            </Routes>
          </PageTransition>
          
          <footer className="py-16 border-t border-zinc-900 bg-zinc-950/50">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                  <Flame size={16} className="text-rose-500" />
                </div>
                <span className="font-black text-xl text-zinc-200 tracking-tighter uppercase italic">Stakes.io</span>
              </div>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Stop procrastinating. Put something on the line. Verifiable accountability for high-performers.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
