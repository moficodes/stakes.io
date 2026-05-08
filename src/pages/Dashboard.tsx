import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, increment, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Plus,
  ShieldAlert,
  Zap,
  TrendingUp,
  ExternalLink,
  FileIcon,
  LinkIcon,
  Upload
} from 'lucide-react';
import { cn, formatDate, getTimeRemaining } from '../lib/utils';
import { Link } from 'react-router-dom';
import { ImageModal } from '../components/ImageModal';

interface Stake {
  id: string;
  task: string;
  deadline: string;
  stakeType: string;
  stakeValue: string;
  status: 'pending' | 'completed' | 'failed';
  requireProof?: boolean;
  proofURL?: string;
  createdAt: any;
}

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'stakes'),
      where('creatorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stakesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Stake[];
      setStakes(stakesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stakes');
    });

    return unsubscribe;
  }, [user]);

  const [confirming, setConfirming] = useState<{ id: string, type: 'completed' | 'failed' } | null>(null);
  const [proof, setProof] = useState<{ type: 'url' | 'file', value: string }>({ type: 'file', value: '' });
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("File too large. Please use a screenshot under 800KB or use a URL.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProof({ type: 'file', value: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusUpdate = async (stakeId: string, newStatus: 'completed' | 'failed') => {
    if (!user) return;
    
    // Check if proof is required
    const stake = stakes.find(s => s.id === stakeId);
    if (newStatus === 'completed' && stake?.requireProof && !proof.value) {
      alert("Evidence is mandatory for this mission. Please upload a screenshot or provide a URL.");
      return;
    }

    setUploading(true);
    try {
      const stakeRef = doc(db, 'stakes', stakeId);
      const updateData: any = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };

      if (newStatus === 'completed' && proof.value) {
        updateData.proofURL = proof.value;
      }

      await updateDoc(stakeRef, updateData);

      const userRef = doc(db, 'users', user.uid);
      const statField = newStatus === 'completed' ? 'stats.completedCount' : 'stats.failedCount';
      await updateDoc(userRef, {
        [statField]: increment(1),
        updatedAt: serverTimestamp(),
      });
      setConfirming(null);
      setProof({ type: 'file', value: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `stakes/${stakeId}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeStakes = stakes.filter(s => s.status === 'pending');
  const pastStakes = stakes.filter(s => s.status !== 'pending');
  const successRate = userData?.stats.totalStaked 
    ? Math.round(((userData.stats.completedCount || 0) / userData.stats.totalStaked) * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <Flame size={200} className="absolute right-[-40px] top-[-40px] text-white/5 opacity-20 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <div className="relative z-10">
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-4">Account Integrity</h3>
            <div className="flex items-baseline gap-4">
              <div className="text-7xl font-black italic tracking-tighter">{successRate}%</div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-bold",
                successRate >= 80 ? "text-emerald-500" : "text-rose-500"
              )}>
                <TrendingUp size={16} />
                <span>Win Rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col justify-between">
          <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-2">Total Stakes</h3>
          <div className="text-5xl font-black italic">{userData?.stats.totalStaked || 0}</div>
          <div className="text-[10px] uppercase font-bold text-zinc-600 mt-2">Active commitments</div>
        </div>

        <div className="bg-rose-600 p-8 rounded-[2.5rem] flex flex-col justify-between text-white shadow-xl shadow-rose-600/10">
          <h3 className="text-rose-200 font-bold uppercase tracking-widest text-[10px] mb-2">Succeeded</h3>
          <div className="text-5xl font-black italic">{userData?.stats.completedCount || 0}</div>
          <Trophy className="text-white/20 self-end" size={24} />
        </div>
      </div>

      {/* Active Stakes Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-min gap-4 pt-4">
        <div className="md:col-span-4 flex items-center justify-between px-4">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
            OPERATIONAL_COMMITMENTS
          </div>
          <Link to="/create">
             <button className="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-white transition-colors flex items-center gap-2">
               <Plus size={14} /> New Stake
             </button>
          </Link>
        </div>

        <AnimatePresence>
          {activeStakes.length > 0 ? (
            activeStakes.map((stake, i) => (
              <motion.div
                layout
                key={stake.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-zinc-700 transition-colors shrink-0",
                  i === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1"
                )}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-3 py-1 bg-rose-600/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-600/20 rounded-lg">
                      {getTimeRemaining(stake.deadline)}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stake.stakeType}</span>
                  </div>
                  
                  <h3 className={cn(
                    "font-black leading-tight mb-4 uppercase italic",
                    i === 0 ? "text-4xl" : "text-xl"
                  )}>{stake.task}</h3>
                  <div className="flex items-center gap-2 mb-8">
                     <ShieldAlert size={14} className="text-rose-600" />
                     <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Penalty: {stake.stakeValue}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-h-[100px] justify-end">
                  <AnimatePresence mode="wait">
                    {confirming?.id === stake.id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-3"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-center text-rose-500 mb-1">
                          Confirm {confirming.type === 'completed' ? 'Success' : 'Failure'}?
                        </p>

                        {confirming.type === 'completed' && (
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Evidence Required</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setProof({ ...proof, type: 'file' })}
                                  className={cn("text-[8px] font-bold uppercase", proof.type === 'file' ? "text-rose-500" : "text-zinc-600")}
                                >
                                  File
                                </button>
                                <button 
                                  onClick={() => setProof({ ...proof, type: 'url' })}
                                  className={cn("text-[8px] font-bold uppercase", proof.type === 'url' ? "text-rose-500" : "text-zinc-600")}
                                >
                                  URL
                                </button>
                              </div>
                            </div>
                            
                            {proof.type === 'file' ? (
                              <label className="block">
                                <div className={cn(
                                  "w-full h-24 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                  proof.value ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                                )}>
                                  {proof.value ? (
                                    <>
                                      <CheckCircle2 size={16} className="text-emerald-500" />
                                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Screenshot Attached</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={16} className="text-zinc-600" />
                                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Upload Screenshot</span>
                                    </>
                                  )}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                              </label>
                            ) : (
                              <div className="relative">
                                <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input 
                                  type="text" 
                                  placeholder="Link to proof (e.g. Strava, Twitter, Github)"
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:border-rose-600 transition-all text-zinc-300"
                                  value={proof.value}
                                  onChange={(e) => setProof({ ...proof, value: e.target.value })}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            disabled={uploading}
                            onClick={() => handleStatusUpdate(stake.id, confirming.type)}
                            className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-rose-700 transition-all disabled:opacity-50"
                          >
                             {uploading ? 'Processing...' : 'Confirm Deploy'}
                          </button>
                          <button
                            onClick={() => setConfirming(null)}
                            className="flex-1 bg-zinc-800 text-zinc-400 py-3 rounded-xl font-black text-xs uppercase tracking-tighter hover:text-zinc-100 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="actions"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col gap-3"
                      >
                        <button
                          onClick={() => setConfirming({ id: stake.id, type: 'completed' })}
                          className="w-full bg-zinc-100 text-zinc-950 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={18} />
                          Mission Complete
                        </button>
                        <button
                          onClick={() => setConfirming({ id: stake.id, type: 'failed' })}
                          className="w-full bg-zinc-950 text-zinc-500 py-3 rounded-2xl font-bold text-xs uppercase tracking-tighter hover:bg-rose-950 hover:text-rose-500 transition-all border border-zinc-800 flex items-center justify-center gap-2"
                        >
                          <XCircle size={14} />
                          Report Failure
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="md:col-span-4 py-24 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center text-center px-4">
              <Zap size={48} className="text-zinc-800 mb-6" />
              <h3 className="font-black text-zinc-400 uppercase italic tracking-tighter text-xl mb-2">No Active Missions</h3>
              <p className="text-sm text-zinc-600 mb-8 max-w-xs">You are currently at zero risk. That's a dangerous place to be.</p>
              <Link to="/create">
                <button className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-lg shadow-rose-600/20">
                  Deploy First Stake
                </button>
              </Link>
            </div>
          )}
        </AnimatePresence>

        {/* History Bento Section */}
        {pastStakes.length > 0 && (
          <div className="md:col-span-4 mt-8 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 px-4">MISSION_LOGS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastStakes.map((stake) => (
                <div
                  key={stake.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 flex items-center justify-between group hover:bg-zinc-800/50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border",
                      stake.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    )}>
                      {stake.status === 'completed' ? <Trophy size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase italic tracking-tighter">{stake.task}</h4>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
                          {formatDate(stake.createdAt.toDate())}
                        </span>
                        {stake.proofURL && (
                          <div className="flex flex-col gap-2 mt-1">
                            <a 
                              href={stake.proofURL} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline w-fit"
                            >
                              <ExternalLink size={10} />
                              Evidence
                            </a>
                            {stake.proofURL.startsWith('data:image/') && (
                              <img 
                                src={stake.proofURL} 
                                alt="Proof" 
                                className="w-16 h-16 object-cover rounded-lg border border-zinc-800 cursor-zoom-in hover:brightness-110 transition-all"
                                referrerPolicy="no-referrer"
                                onClick={() => setModalImage(stake.proofURL!)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block mb-1 border",
                      stake.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      {stake.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ImageModal 
        isOpen={!!modalImage} 
        onClose={() => setModalImage(null)} 
        imageSrc={modalImage || ''} 
      />
    </div>
  );
}
