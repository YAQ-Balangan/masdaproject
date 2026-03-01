// src/pages/Selection.jsx
import React from "react";
import { motion } from "framer-motion";
import { User, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { fadeUp, staggerContainer } from "../config/constants";

export default function Selection({ navigateTo }) {
  return (
    <motion.div
      key="sel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen p-6 relative"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-emerald-200/40 to-transparent blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tl from-amber-200/30 to-transparent blur-3xl" />
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 text-amber-400 rounded-[2rem] mb-6 shadow-xl shadow-slate-900/20 border-4 border-emerald-500/20">
          <GraduationCap className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">
          Portal <span className="text-emerald-600">Akademik.</span>
        </h1>
        <p className="text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
          Sistem informasi monitoring nilai secara real-time. Silakan pilih
          portal akses Anda.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6 w-full max-w-3xl"
      >
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo("login-guru")}
          className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] transition-all duration-300 text-left flex flex-col items-start relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100%] -z-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="w-16 h-16 bg-slate-50 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
            <User size={28} />
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-800">
            Akses Pendidik
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Masuk sebagai tenaga pendidik untuk memonitor rekapitulasi nilai
            seluruh santri.
          </p>
          <div className="mt-8 flex items-center text-emerald-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
            Masuk Portal <ChevronRight size={18} className="ml-1" />
          </div>
        </motion.button>

        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo("login-santri")}
          className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-[0_8px_30px_rgb(245,158,11,0.15)] transition-all duration-300 text-left flex flex-col items-start relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100%] -z-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="w-16 h-16 bg-slate-50 text-slate-700 group-hover:bg-amber-500 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
            <BookOpen size={28} />
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-800">
            Portal Santri
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Akses personal santri untuk melihat rapor evaluasi hasil belajar
            secara mandiri.
          </p>
          <div className="mt-8 flex items-center text-amber-500 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
            Cari Data <ChevronRight size={18} className="ml-1" />
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
