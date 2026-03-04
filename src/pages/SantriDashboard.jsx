// src/pages/SantriDashboard.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// Mendeklarasikan konstan animasi secara lokal agar terhindar dari error import
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

export default function SantriDashboard({
  navigateTo,
  activeStudent,
  keysMapping,
  allMapel,
}) {
  // --- PRE-PROCESSING: MERGE & FILTERING MAPEL BERDASARKAN JURUSAN ---
  const { mergedStudent, mergedAllMapel } = useMemo(() => {
    if (!activeStudent) return { mergedStudent: null, mergedAllMapel: [] };

    const newStudent = { ...activeStudent };
    const kelasMurid = String(newStudent[keysMapping.keyKelas]).toUpperCase();
    const isMipa = kelasMurid.includes("MIPA") || kelasMurid.includes("IPA");
    const isIps = kelasMurid.includes("IPS");

    // 1. LOGIKA MERGE DATA NILAI: BAHASA INDONESIA
    const valBindoIpa =
      newStudent["Bahasa Indonesia (IPA)"] ||
      newStudent["Bahasa Indonesia (MIPA)"];
    if (
      valBindoIpa !== undefined &&
      valBindoIpa !== null &&
      valBindoIpa !== "" &&
      valBindoIpa !== "-"
    ) {
      newStudent["Bahasa Indonesia"] = valBindoIpa;
    }
    delete newStudent["Bahasa Indonesia (IPA)"];
    delete newStudent["Bahasa Indonesia (MIPA)"];

    // 2. LOGIKA MERGE DATA NILAI: EKONOMI
    const valEkoIpa =
      newStudent["Ekonomi (IPA)"] || newStudent["Ekonomi (MIPA)"];
    const valEkoIps = newStudent["Ekonomi (IPS)"];
    // Ambil mana yang ada nilainya, atau pakai Ekonomi default jika ada
    const valEkoMerged = valEkoIpa || valEkoIps || newStudent["Ekonomi"];

    if (
      valEkoMerged !== undefined &&
      valEkoMerged !== null &&
      valEkoMerged !== "" &&
      valEkoMerged !== "-"
    ) {
      newStudent["Ekonomi"] = valEkoMerged;
    }
    delete newStudent["Ekonomi (IPA)"];
    delete newStudent["Ekonomi (MIPA)"];
    delete newStudent["Ekonomi (IPS)"];

    // 3. LOGIKA PENYUSUNAN DAFTAR TAMPILAN MAPEL
    const newMapel = [];

    allMapel.forEach((m) => {
      // Jika mendeteksi versi IPA/MIPA dari B.Indo, daftarkan sebagai "Bahasa Indonesia"
      if (m === "Bahasa Indonesia (IPA)" || m === "Bahasa Indonesia (MIPA)") {
        if (!newMapel.includes("Bahasa Indonesia"))
          newMapel.push("Bahasa Indonesia");
        return; // Skip agar nama aslinya tidak ikut masuk
      }

      // Jika mendeteksi versi IPA/MIPA/IPS dari Ekonomi, daftarkan sebagai "Ekonomi"
      if (
        m === "Ekonomi (IPA)" ||
        m === "Ekonomi (MIPA)" ||
        m === "Ekonomi (IPS)"
      ) {
        if (!newMapel.includes("Ekonomi")) newMapel.push("Ekonomi");
        return; // Skip agar nama aslinya tidak ikut masuk
      }

      // Aturan Filtering Visibilitas Jurusan
      const mUpper = m.toUpperCase();
      // Santri MIPA tidak boleh lihat mapel embel-embel (IPS)
      if (isMipa && mUpper.includes("(IPS)")) return;
      // Santri IPS tidak boleh lihat mapel embel-embel (IPA) atau (MIPA)
      if (isIps && (mUpper.includes("(MIPA)") || mUpper.includes("(IPA)")))
        return;

      // Jika lolos semua filter di atas dan belum ada di list, masukkan!
      if (!newMapel.includes(m)) newMapel.push(m);
    });

    return { mergedStudent: newStudent, mergedAllMapel: newMapel };
  }, [activeStudent, allMapel, keysMapping]);
  // ------------------------------------------------------------

  if (!mergedStudent) return null;

  return (
    <motion.div
      key="sd"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative p-6 pt-10 overflow-hidden z-0 santri-live-bg"
    >
      {/* CSS Live Wallpaper Background */}
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .santri-live-bg {
          background: linear-gradient(-45deg, #f0fdf4, #ecfdf5, #fffbeb, #f0fdfa);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }
      `}</style>

      {/* Elemen Latar Belakang Melayang */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] bg-emerald-300/20 rounded-[40%] blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-amber-300/15 rounded-[45%] blur-[80px]"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateTo("selection")}
          className="p-4 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-amber-500 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all border border-slate-100/50"
        >
          <ArrowLeft />
        </motion.button>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
          className="bg-slate-900/95 backdrop-blur-xl p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-[0_20px_50px_rgb(0,0,0,0.2)] border border-slate-700/50 relative overflow-hidden group"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"
          />

          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-[2rem] flex items-center justify-center text-4xl font-black text-slate-900 shadow-xl shadow-amber-500/30 z-10 border-4 border-amber-200/50 transition-transform"
          >
            {mergedStudent[keysMapping.keyNama].charAt(0)}
          </motion.div>

          <div className="flex-1 text-center md:text-left z-10">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black uppercase tracking-tight text-white mb-2 drop-shadow-md"
            >
              {mergedStudent[keysMapping.keyNama]}
            </motion.h2>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs text-amber-300 font-bold uppercase tracking-widest border border-white/10 shadow-inner"
            >
              Kelas {mergedStudent[keysMapping.keyKelas]}
            </motion.span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-center bg-emerald-950/60 p-5 rounded-3xl border border-emerald-500/30 backdrop-blur-md z-10 min-w-[120px] shadow-inner group-hover:border-emerald-400/50 transition-colors"
          >
            <div className="text-4xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              {mergedStudent.RataRata || 0}
            </div>
            <div className="text-[9px] text-emerald-300 font-black uppercase tracking-widest mt-1">
              Rata-Rata
            </div>
          </motion.div>
        </motion.div>

        {/* Grid Nilai Mata Pelajaran */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {mergedAllMapel.map((m) => {
            const nilai = mergedStudent[m] || 0;
            return (
              <motion.div
                key={m}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/85 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm hover:shadow-[0_15px_30px_rgb(16,185,129,0.1)] border border-white hover:border-emerald-200 transition-all duration-300 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-100/0 group-hover:from-emerald-50/50 group-hover:to-emerald-100/50 transition-colors duration-300 -z-10" />

                <div className="flex justify-between items-start mb-6">
                  <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-500 uppercase tracking-widest leading-tight pr-4 transition-colors">
                    {m}
                  </span>
                  <span className="text-3xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {nilai}
                  </span>
                </div>

                <div className="h-3 bg-slate-200/70 rounded-full overflow-hidden shadow-inner relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nilai}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 relative overflow-hidden rounded-full"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 1.5,
                      }}
                      className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
