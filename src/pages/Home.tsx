import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { ArrowRight, ShieldAlert, Zap, Users, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const { user, signIn } = useAuth();
  const [totalPool, setTotalPool] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Track total money pool
    const poolQuery = query(
      collection(db, 'stakes'),
      where('status', '==', 'pending'),
      where('stakeType', '==', 'money')
    );

    const unsubscribePool = onSnapshot(poolQuery, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const valueStr = data.stakeValue || '0';
        const numericValue = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
          total += numericValue;
        }
      });
      setTotalPool(total);
    });

    // Track total user count
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUserCount(snapshot.size);
    });

    return () => {
      unsubscribePool();
      unsubscribeUsers();
    };
  }, []);

  return (
    <div className="flex flex-col gap-32">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-5xl mx-auto gap-8 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 border border-zinc-800"
        >
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span>JOIN {userCount > 0 ? (userCount + 842).toLocaleString() : '842'} ACTIVE OPERATIVES</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic"
        >
          FORCE <span className="text-zinc-800">YOUR</span> <br/>
          <span className="text-rose-600">PROGRESS.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-zinc-400 max-w-xl leading-relaxed mt-4"
        >
          Stop negotiating with your procrastination. Set a goal, stake your reputation, and execute. No excuses, just results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 mt-8"
        >
          {user ? (
            <Link to="/dashboard">
              <button className="bg-zinc-100 text-zinc-950 px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 hover:bg-white transition-all shadow-2xl shadow-white/5 uppercase tracking-tighter">
                Enter Arena
                <ArrowRight size={22} />
              </button>
            </Link>
          ) : (
            <button
              onClick={signIn}
              className="bg-rose-600 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-3 hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/20 uppercase tracking-tighter"
            >
              Start A Stake
              <ArrowRight size={22} />
            </button>
          )}
          <button 
            onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-zinc-900 text-zinc-200 border border-zinc-800 px-10 py-5 rounded-2xl font-black text-xl hover:bg-zinc-800 transition-all uppercase tracking-tighter"
          >
            Manifesto
          </button>
        </motion.div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="py-24 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-rose-600">STAKES_MANIFESTO_V1.0</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9]">Comfort is the <br/>slowest death.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-zinc-600 font-black text-2xl italic tracking-tighter">01.</span>
                <h4 className="text-xl font-bold uppercase italic tracking-tight">Binary Execution</h4>
                <p className="text-zinc-500 leading-relaxed">
                  In our world, 99% done is 0% done. You either meet the deadline or you trigger the penalty. There is no middle ground, no excuses, and no "next time."
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-zinc-600 font-black text-2xl italic tracking-tighter">02.</span>
                <h4 className="text-xl font-bold uppercase italic tracking-tight">Fear as Fuel</h4>
                <p className="text-zinc-500 leading-relaxed">
                  Pure motivation is a lie told to the weak. We use the primal fear of loss—of money, of reputation, of dignity—to hammer progress into reality.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-zinc-600 font-black text-2xl italic tracking-tighter">03.</span>
                <h4 className="text-xl font-bold uppercase italic tracking-tight">Radical Integrity</h4>
                <p className="text-zinc-500 leading-relaxed">
                  A man who breaks a promise to himself is a man who cannot be trusted by anyone. Your stake is a blood-oath to your own potential.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-zinc-600 font-black text-2xl italic tracking-tighter">04.</span>
                <h4 className="text-xl font-bold uppercase italic tracking-tight">The Arena is Public</h4>
                <p className="text-zinc-500 leading-relaxed">
                  Excellence is not performed in the shadows. We build in the open, we fail in the open, and we win in the open. Witness the pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-rose-600 to-rose-900 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group"
        >
          <Flame size={300} className="absolute -bottom-20 -right-20 text-black/10 group-hover:rotate-12 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <h3 className="text-4xl font-black text-white leading-tight uppercase mb-4 italic">Skin in the <br/>Game.</h3>
            <p className="text-rose-100 text-lg leading-relaxed max-w-sm">
              Stake money, social reputation, or donations. When the cost of failure is real, success becomes inevitable.
            </p>
          </div>
          <div className="relative z-10 mt-12 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
             <div className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2">Live Stakes Pool</div>
             <div className="text-2xl font-black text-white">${totalPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between"
        >
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <Users size={20} className="text-zinc-400" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-100 mb-2 uppercase tracking-tight">Social Web</h4>
            <p className="text-zinc-500 text-sm">Public accountability via automated shame-tweets and peer-check-ins.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-between"
        >
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <Trophy size={20} className="text-zinc-400" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-100 mb-2 uppercase tracking-tight">Proof Check</h4>
            <p className="text-zinc-500 text-sm">Proof-of-work validation through visual assets and verifiable logs.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 flex items-center gap-8"
        >
          <div className="flex-1 space-y-4">
            <h4 className="text-2xl font-black uppercase italic tracking-tighter">Collective Pressure.</h4>
            <p className="text-zinc-500 text-sm">Join tribes with shared goals. Compete to see who breaks first. (Coming Soon)</p>
          </div>
          <div className="w-32 h-32 bg-zinc-950 rounded-3xl border border-zinc-800 flex items-center justify-center">
            <Zap size={48} className="text-zinc-800" />
          </div>
        </motion.div>
      </section>

      {/* High Stakes CTA */}
      <section className="bg-zinc-100 text-zinc-950 rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-zinc-200 rounded-full blur-3xl opacity-50" />
         <div className="relative z-10 max-w-3xl">
           <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.85] uppercase italic">TIME IS THE<br/> ONLY ASSET<br/> YOU CAN'T<br/> <span className="text-zinc-400">BUY BACK.</span></h2>
           <p className="text-xl text-zinc-600 mb-12 max-w-xl font-medium">
             Don't let another year slip by. Set your first stake today and experience what it feels like to finally be unstoppable.
           </p>
           <button
             onClick={signIn}
             className="bg-rose-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 uppercase tracking-tighter"
           >
             Initialize Stake
           </button>
         </div>
      </section>
    </div>
  );
}
