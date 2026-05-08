import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Calendar, DollarSign, MessageSquare, Heart, ShieldAlert, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CreateStake() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    task: '',
    deadline: '',
    stakeType: 'social_shame' as 'money' | 'social_shame' | 'charity',
    stakeValue: '',
    requireProof: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const stakeData = {
        creatorId: user.uid,
        creatorName: user.displayName,
        creatorPhoto: user.photoURL,
        task: formData.task,
        deadline: new Date(formData.deadline).toISOString(),
        stakeType: formData.stakeType,
        stakeValue: formData.stakeValue,
        requireProof: formData.requireProof,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'stakes'), stakeData);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'stats.totalStaked': increment(1),
        updatedAt: serverTimestamp(),
      });

      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'stakes');
    } finally {
      setLoading(false);
    }
  };

  const stakeOptions = [
    { id: 'social_shame', name: 'Social Shame', icon: MessageSquare, desc: 'A public post admitting your failure' },
    { id: 'money', name: 'Money', icon: DollarSign, desc: 'Lose a small amount of cash' },
    { id: 'charity', name: 'Charity', icon: Heart, desc: 'Donate to a charity you dislike' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors group px-4"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-[0.2em]">Abort Session</span>
      </button>

      <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 p-8 md:p-16 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ShieldAlert size={120} />
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">NEW_STAKE.exe</h1>
          <p className="text-zinc-500 mb-12 uppercase text-[10px] font-bold tracking-[0.3em]">Initialize your operational commitment</p>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Task Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block">THE MISSION</label>
              <textarea
                required
                rows={3}
                placeholder="What exactly are you going to achieve?"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 focus:ring-1 focus:ring-rose-600 focus:border-rose-600 outline-none transition-all resize-none text-xl font-bold uppercase italic tracking-tighter placeholder:text-zinc-800"
                value={formData.task}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Deadline */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block flex items-center gap-2">
                  <Calendar size={12} />
                  DEADLINE_UTC
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {[
                    { label: '+1 Hour', val: () => { const d = new Date(); d.setHours(d.getHours() + 1); return d; } },
                    { label: '+24 Hours', val: () => { const d = new Date(); d.setHours(d.getHours() + 24); return d; } },
                    { label: '+3 Days', val: () => { const d = new Date(); d.setDate(d.getDate() + 3); return d; } },
                    { label: '+1 Week', val: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const d = preset.val();
                        // Format to YYYY-MM-DDTHH:mm for datetime-local
                        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        setFormData({ ...formData, deadline: iso });
                      }}
                      className="py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  required
                  type="datetime-local"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:ring-1 focus:ring-rose-600 focus:border-rose-600 outline-none transition-all font-mono text-zinc-400"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

               {/* Stake Value */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block">
                  THE PENALTY
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Lose $100"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus:ring-1 focus:ring-rose-600 focus:border-rose-600 outline-none transition-all font-bold text-zinc-200 placeholder:text-zinc-800"
                  value={formData.stakeValue}
                  onChange={(e) => setFormData({ ...formData, stakeValue: e.target.value })}
                />
              </div>
            </div>

            {/* Stake Type */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block">ENFORCEMENT_PROTOCOL</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stakeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, stakeType: opt.id as any })}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all text-left group/btn",
                      formData.stakeType === opt.id 
                        ? "border-rose-600 bg-rose-600/10 text-rose-500 shadow-xl shadow-rose-600/5 font-black uppercase italic tracking-tighter" 
                        : "border-zinc-800 bg-zinc-950 text-zinc-600 hover:border-zinc-700 font-bold uppercase tracking-tighter"
                    )}
                  >
                    <opt.icon size={24} className={cn(
                      formData.stakeType === opt.id ? "text-rose-500" : "text-zinc-700 group-hover/btn:text-zinc-400"
                    )} />
                    <span className="text-xs">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-rose-950/20 border border-rose-900/30 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  id="requireProof"
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-rose-600 focus:ring-rose-600"
                  checked={formData.requireProof}
                  onChange={(e) => setFormData({ ...formData, requireProof: e.target.checked })}
                />
                <label htmlFor="requireProof" className="text-xs font-bold text-zinc-300 uppercase tracking-widest cursor-pointer">
                  Require Evidence for completion
                </label>
              </div>

              <div className="flex items-start gap-4 pt-4 border-t border-rose-900/30">
                <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-rose-400 font-medium leading-relaxed">
                  CAUTION: THIS ACTION CANNOT BE REVERSED once deployed to the arena. Deployment requires full commitment to the protocol and its consequences.
                </p>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-zinc-100 text-zinc-950 py-6 rounded-2xl font-black text-2xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-white/5 uppercase italic tracking-tighter"
            >
              {loading ? "INITIALIZING..." : "DEPLOY STAKE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
