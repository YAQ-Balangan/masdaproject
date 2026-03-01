// src/pages/Selection.jsx
import React from "react";
import { motion } from "framer-motion";
import { User, BookOpen, ChevronRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Selection({ navigateTo }) {
  return (
    <motion.div
      key="sel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      // Tambahkan kelas khusus untuk animasi background keseluruhan
      className="flex flex-col items-center justify-center min-h-screen p-6 relative selection-live-bg overflow-hidden z-0"
    >
      {/* CSS Khusus untuk Live Wallpaper Background */}
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .selection-live-bg {
          /* Gradasi warna yang sangat lembut: campuran emerald, amber, dan teal muda */
          background: linear-gradient(-45deg, #f0fdf4, #ecfdf5, #fffbeb, #f0fdfa);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}</style>

      {/* Elemen Latar Belakang Melayang (Floating Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-300/20 rounded-[40%] blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 100, -50, 0],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-amber-300/15 rounded-[45%] blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, 50, -100, 0],
            y: [0, 50, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] bg-teal-300/20 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-12 text-center relative z-10"
      >
        {/* LOGO BARU MENGGUNAKAN um.svg */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center mb-6"
        >
          <img
            src="/um.svg"
            alt="Logo Ujian Madrasah"
            className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-xl"
            onError={(e) => {
              // Fallback jika gambar belum ada
              e.target.style.display = "none";
              e.target.insertAdjacentHTML(
                "afterend",
                '<div class="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs text-center border-4 border-white shadow-xl">um.svg<br/>tidak<br/>ditemukan</div>',
              );
            }}
          />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">
          Ujian <span className="text-emerald-600">Madrasah</span>{" "}
          <span className="text-amber-500">2026</span>
        </h1>
        <h2 className="text-4xl md:text-3xl font-black text-slate-500 mb-4 tracking-tight drop-shadow-sm">
          MA Darussalam Awayan
        </h2>
        <p className="text-slate-600 font-medium max-w-md mx-auto leading-relaxed bg-white/40 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/50">
          Sistem informasi monitoring nilai secara real-time. Silakan pilih
          portal akses Anda.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6 w-full max-w-3xl relative z-10"
      >
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo("login-guru")}
          // Penambahan bg-white/90 & backdrop-blur-xl agar selaras dengan background animasi
          className="group p-8 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] transition-all duration-300 text-left flex flex-col items-start relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-bl-[100%] -z-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="w-16 h-16 bg-slate-50 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
            <User size={28} />
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-800">
            Akses Pendidik
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Masuk sebagai tenaga pendidik untuk memonitor rekapitulasi nilai
            seluruh murid.
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
          // Penambahan bg-white/90 & backdrop-blur-xl agar selaras dengan background animasi
          className="group p-8 bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_40px_rgb(245,158,11,0.15)] transition-all duration-300 text-left flex flex-col items-start relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-bl-[100%] -z-10 transition-transform group-hover:scale-150 duration-500" />
          <div className="w-16 h-16 bg-slate-50 text-slate-700 group-hover:bg-amber-500 group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner">
            <BookOpen size={28} />
          </div>
          <h2 className="text-2xl font-black mb-3 text-slate-800">
            Akses Murid
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Akses personal murid untuk melihat rapor evaluasi hasil belajar
            secara mandiri.
          </p>
          <div className="mt-8 flex items-center text-amber-500 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
            Masuk Portal <ChevronRight size={18} className="ml-1" />
          </div>
        </motion.button>
      </motion.div>

      {/* FOOTER / CREDIT SECTION */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="absolute bottom-6 w-full text-center z-10 px-4"
      >
        <p className="text-[11px] md:text-xs font-semibold text-slate-500/80 tracking-wide drop-shadow-sm">
          &copy; {new Date().getFullYear()} Hak Cipta Dilindungi. Dirancang &
          Dikembangkan oleh{" "}
          <span className="text-emerald-600 font-black">Ahmad Maulana</span>.
        </p>
      </motion.div>
    </motion.div>
  );
}
