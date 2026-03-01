// src/pages/SantriDashboard.jsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { fadeUp, staggerContainer } from "../config/constants";

export default function SantriDashboard({
  navigateTo,
  activeStudent,
  keysMapping,
  allMapel,
}) {
  if (!activeStudent) return null;

  return (
    <motion.div
      key="sd"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 space-y-6 pt-10"
    >
      <motion.button
        whileHover={{ scale: 1.1, x: -5 }}
        onClick={() => navigateTo("selection")}
        className="p-4 bg-white text-slate-700 hover:text-amber-500 rounded-full shadow-md transition-colors border border-slate-100"
      >
        <ArrowLeft />
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-[0_20px_50px_rgb(0,0,0,0.2)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />

        <div className="w-24 h-24 bg-amber-400 rounded-[2rem] flex items-center justify-center text-4xl font-black text-slate-900 shadow-xl shadow-amber-400/20 z-10 border-4 border-amber-200/50">
          {activeStudent[keysMapping.keyNama].charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-1">
            {activeStudent[keysMapping.keyNama]}
          </h2>
          <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-xs text-amber-300 font-bold uppercase tracking-widest border border-white/5">
            Kelas {activeStudent[keysMapping.keyKelas]}
          </span>
        </div>
        <div className="text-center bg-emerald-950/50 p-5 rounded-3xl border border-emerald-500/20 backdrop-blur-sm z-10 min-w-[120px]">
          <div className="text-4xl font-black text-amber-400 drop-shadow-md">
            {activeStudent.RataRata}
          </div>
          <div className="text-[9px] text-emerald-300 font-black uppercase tracking-widest mt-1">
            Rata-Rata
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {allMapel.map((m) => (
          <motion.div
            key={m}
            variants={fadeUp}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 hover:border-emerald-100 transition-colors group"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-tight pr-4">
                {m}
              </span>
              <span className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                {activeStudent[m] || 0}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activeStudent[m] || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 relative"
              >
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
