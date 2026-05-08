import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Zap,
  ExternalLink
} from 'lucide-react';
import { ImageModal } from '../components/ImageModal';
import { cn, formatDate, getTimeRemaining } from '../lib/utils';

interface Stake {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto: string;
  task: string;
  deadline: string;
  stakeType: string;
  stakeValue: string;
  status: 'pending' | 'completed' | 'failed';
  requireProof?: boolean;
  proofURL?: string;
  createdAt: any;
}

function StakeCard({ stake, i }: { stake: Stake, i: number, key?: React.Key }) {
  const { user } = useAuth();
  const [cheerCount, setCheerCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const cheerRef = collection(db, `stakes/${stake.id}/cheers`);
    const unsubscribe = onSnapshot(cheerRef, (snapshot) => {
      setCheerCount(snapshot.size);
    });
    return unsubscribe;
  }, [stake.id]);

  const handleCheer = async (stakeId: string) => {
    if (!user) return;
    try {
      const cheerRef = collection(db, `stakes/${stakeId}/cheers`);
      await addDoc(cheerRef, {
        userId: user.uid,
        userName: user.displayName,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `stakes/${stakeId}/cheers`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.05 }}
      className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all relative overflow-hidden group"
    >
      <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
        <Flame size={200} className="text-white" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        <div className="shrink-0">
          <div className="relative">
            <img 
              src={stake.creatorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stake.creatorId}`} 
              alt={stake.creatorName}
              className="w-16 h-16 rounded-2xl object-cover bg-zinc-950 border-2 border-zinc-800 group-hover:border-rose-600 transition-colors"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-800">
              <Zap size={10} className="text-rose-600" />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-lg uppercase italic tracking-tighter text-zinc-200">{stake.creatorName}</h3>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                Committed {formatDate(stake.createdAt?.toDate() || new Date())}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-600/10 text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-600/20">
              <Clock size={12} />
              {getTimeRemaining(stake.deadline)}
            </div>
          </div>

          <p className="text-2xl font-black uppercase italic tracking-tighter text-zinc-100 leading-tight">
            "{stake.task}"
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-4 py-3 px-5 bg-zinc-950 rounded-2xl border border-zinc-800">
              <ShieldAlert size={16} className="text-rose-600 shrink-0" />
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Stake:</span>
                <span className="font-black text-zinc-400 uppercase tracking-tighter text-sm italic">{stake.stakeValue}</span>
              </div>
            </div>
            
            {stake.proofURL && (
              <div className="space-y-3">
                <div className="px-5 py-2">
                  <a 
                    href={stake.proofURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-2"
                  >
                    <ExternalLink size={12} />
                    View Deployment Evidence
                  </a>
                </div>
                {stake.proofURL.startsWith('data:image/') && (
                  <div className="px-5">
                    <img 
                      id={`proof-image-${stake.id}`}
                      src={stake.proofURL} 
                      alt="Proof of completion" 
                      className="w-full max-h-64 object-cover rounded-2xl border border-zinc-800 cursor-zoom-in hover:brightness-110 transition-all"
                      referrerPolicy="no-referrer"
                      onClick={() => setIsModalOpen(true)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleCheer(stake.id)}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group/cheer",
                  "text-zinc-500 hover:text-zinc-100"
                )}
              >
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 group-hover/cheer:border-rose-600 transition-all">
                  <Heart size={16} className="fill-transparent group-hover/cheer:fill-rose-600 group-hover/cheer:text-rose-600 transition-all" />
                </div>
                <span>{cheerCount} Supporters</span>
              </button>
            </div>
            <div className="text-[10px] uppercase font-bold text-zinc-700 tracking-widest">
              {stake.stakeType}
            </div>
          </div>
        </div>
      </div>

      {stake.proofURL && (
        <ImageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          imageSrc={stake.proofURL} 
        />
      )}
    </motion.div>
  );
}

export default function Feed() {
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'stakes'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stakesData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Stake[];
      setStakes(stakesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'stakes');
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col gap-3 px-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">PUBLIC_ARENA</h1>
        <div className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.3em] flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
           Live monitoring from the global persistence swarm
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {stakes.length > 0 ? (
            stakes.map((stake: Stake, i: number) => (
              <StakeCard key={stake.id} stake={stake} i={i} />
            ))
          ) : (
            <div className="py-32 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[3rem]">
              <Zap size={64} className="text-zinc-800 mx-auto mb-6" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-600">The Arena is Idle</h3>
              <p className="text-zinc-700 text-sm font-bold uppercase tracking-widest">No active deployments detected.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
