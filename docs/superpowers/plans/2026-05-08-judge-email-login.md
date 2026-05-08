# Email/Password Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an authentication modal to allow hackathon judges to log in via email/password alongside the existing Google sign-in.

**Architecture:** Create an `AuthModal` component to handle the UI. Update `AuthContext` to expose `signInWithEmail` and control the modal's visibility so it can be triggered from anywhere in the app (like `Home` or `Navigation`).

**Tech Stack:** React, Firebase Auth (`signInWithEmailAndPassword`), `lucide-react`, Tailwind CSS.

---

### Task 1: Update AuthContext for Email Login and Modal State

**Files:**
- Modify: `src/lib/AuthContext.tsx`
- Modify: `src/lib/firebase.ts`

- [ ] **Step 1: Export required Firebase auth functions**
Update `src/lib/firebase.ts` to export `signInWithEmailAndPassword`.

```typescript
// Add to imports in src/lib/firebase.ts
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';

// Add export at the bottom or near other auth exports
export { signInWithEmailAndPassword };
```

- [ ] **Step 2: Update AuthContext type definitions**
Modify `src/lib/AuthContext.tsx` to include `signInWithEmail`, `isAuthModalOpen`, `openAuthModal`, and `closeAuthModal`.

```tsx
// Update AuthContextType in src/lib/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}
```

- [ ] **Step 3: Implement new state and methods in AuthProvider**
Add the state for the modal and the implementation for email sign in. Rename the existing `signIn` to `signInWithGoogle`.

```tsx
// Inside AuthProvider component in src/lib/AuthContext.tsx
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { signInWithEmailAndPassword } = await import('./firebase');
      await signInWithEmailAndPassword(auth, email, password);
      closeAuthModal();
    } catch (error) {
      console.error("Email sign in failed:", error);
      throw error;
    }
  };

  // Update the Provider value
  return (
    <AuthContext.Provider value={{ 
      user, userData, loading, 
      signInWithGoogle, signInWithEmail, logout,
      isAuthModalOpen, openAuthModal, closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
```

### Task 2: Create the AuthModal Component

**Files:**
- Create: `src/components/AuthModal.tsx`

- [ ] **Step 1: Implement the AuthModal component**
Create a new file `src/components/AuthModal.tsx` with the following content.

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Flame } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeAuthModal]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
           onClick={closeAuthModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl" />

            <button
              onClick={closeAuthModal}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-rose-600 p-2 rounded-xl">
                <Flame size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Access</h2>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full bg-white text-zinc-950 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors mb-8 uppercase tracking-tight"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center py-4 mb-4">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs font-bold uppercase tracking-widest">Or Judge Access</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Judge Email"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-zinc-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-100 text-zinc-950 font-black uppercase italic tracking-tighter py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Task 3: Integrate AuthModal into the App Layout

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Render AuthModal in App.tsx**
Import and add `<AuthModal />` to the root `App` component, inside the `AuthProvider` but outside the main routing structure so it overlays everything.

```tsx
// Add import in src/App.tsx
import { AuthModal } from './components/AuthModal';

// Update the Navigation component to use openAuthModal
function Navigation() {
  const { user, openAuthModal, logout } = useAuth();
  // ... rest of the component
  
  // Change the Sign In button
  <button
    onClick={openAuthModal}
    className="bg-rose-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
  >
    Sign In
  </button>
```

```tsx
// Inside App default export
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-600 selection:text-white">
          <Navigation />
          <AuthModal />
          {/* ... rest of App */}
```

- [ ] **Step 2: Update Home.tsx to use openAuthModal**
Replace `signIn` with `openAuthModal` in `src/pages/Home.tsx`.

```tsx
// In src/pages/Home.tsx
  const { user, openAuthModal } = useAuth(); // Update destructuring

// ... further down, update both buttons ...
          <button
            onClick={openAuthModal}
            className="bg-rose-600 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20 uppercase tracking-tighter"
          >
            Start A Stake
            <ArrowRight size={22} />
          </button>

// ... and the bottom CTA
          <button
             onClick={openAuthModal}
             className="bg-rose-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 uppercase tracking-tighter"
           >
             Initialize Stake
           </button>
```

- [ ] **Step 3: Fix test files if applicable**
If there are any tests that mock `useAuth`, ensure they mock `signInWithGoogle`, `signInWithEmail`, `isAuthModalOpen`, `openAuthModal`, and `closeAuthModal` instead of `signIn`. (Optional check).
