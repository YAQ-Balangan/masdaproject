// src/pages/SantriDashboard.jsx
import React, { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Flag, User, Target } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// --- KOMPONEN RACE UNTUK SANTRI ---
const RaceItem = memo(
  ({
    item,
    idx,
    selectedMapel,
    keysMapping,
    activeStudentName,
    activeStudentKelas,
  }) => {
    const rawVal = item[selectedMapel];
    const nilai = typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
    const isFinished = nilai > 0;

    // Deteksi Jurusan untuk warna label (seperti di GuruDashboard)
    const namaKelas =
      item[keysMapping.keyKelas]?.toString().toUpperCase() || "";
    const isMipa = namaKelas.includes("MIPA") || namaKelas.includes("IPA");

    // Cek apakah item ini adalah data milik siswa yang sedang login (harus cocok nama & kelas agar akurat)
    const isMe =
      item[keysMapping.keyNama] === activeStudentName &&
      item[keysMapping.keyKelas] === activeStudentKelas;

    const labelColor = isMe
      ? "text-white bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 z-10"
      : isMipa
        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
        : "text-blue-400 bg-blue-400/10 border-blue-400/20";

    return (
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-4 group relative py-2"
      >
        <div
          className={`w-32 md:w-48 shrink-0 px-3 py-2 rounded-xl border text-[10px] font-black uppercase truncate transition-all shadow-sm ${labelColor}`}
        >
          {idx + 1}. {item[keysMapping.keyNama]} {isMe && "(SAYA)"}
        </div>
        <div
          className={`flex-1 h-8 ${isMe ? "bg-amber-900/30 border-amber-500/50" : "bg-slate-800/50 border-slate-700/50"} rounded-full relative overflow-hidden border`}
        >
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isMe ? "bg-amber-500/60" : isMipa ? "bg-emerald-500/40" : "bg-amber-500/40"}`}
            style={{ width: `${nilai}%` }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-xl drop-shadow-md z-10"
            animate={{ left: `${nilai * 0.9}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
          >
            <div className="relative flex items-center justify-center">
              {nilai === 100 ? (
                <img
                  src="/piala.gif"
                  alt="Finish"
                  className={`h-10 w-auto object-contain drop-shadow-md ${isMe ? "scale-125" : ""}`}
                />
              ) : nilai >= 90 ? (
                <img
                  src="/terbang.gif"
                  alt="Lari Kencang"
                  className={`h-10 w-auto object-contain drop-shadow-md scale-x-[1] ${isMe ? "scale-125" : ""}`}
                />
              ) : isFinished ? (
                <img
                  src="/lari.gif"
                  alt="Lari"
                  className={`h-10 w-auto object-contain drop-shadow-md ${isMe ? "scale-125" : ""}`}
                />
              ) : (
                <img
                  src="/berdiri.gif"
                  alt="Start"
                  className={`h-10 w-auto object-contain drop-shadow-md ${isMe ? "scale-125" : ""}`}
                />
              )}

              {isFinished && (
                <span
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white px-1.5 py-0.5 rounded border z-20 ${isMe ? "bg-amber-600 border-amber-400" : "bg-slate-900 border-slate-700"}`}
                >
                  {nilai}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  },
);

export default function SantriDashboard({
  navigateTo,
  activeStudent,
  keysMapping,
  allMapel,
  processedData, // Diterima dari App.jsx
}) {
  const [viewMode, setViewMode] = useState("nilai"); // nilai, stats, race
  const [scope, setScope] = useState("kelas"); // kelas, jurusan, keseluruhan
  const [selectedMapel, setSelectedMapel] = useState("RataRata");

  // Helper function: Deteksi jurusan dari nama kelas
  const getJurusan = (kelasStr) => {
    if (!kelasStr) return "UMUM";
    const k = kelasStr.toString().toUpperCase();
    if (k.includes("MIPA") || k.includes("IPA")) return "MIPA";
    if (k.includes("IPS")) return "IPS";
    if (k.includes("AGAMA") || k.includes("MAK")) return "AGAMA";
    if (k.includes("BAHASA")) return "BAHASA";
    return "UMUM";
  };

  const studentNama = activeStudent?.[keysMapping.keyNama] || "";
  const studentKelas = activeStudent?.[keysMapping.keyKelas] || "";
  const studentJurusan = getJurusan(studentKelas);

  // Sorting dan Filtering berdasarkan Scope
  const sortedData = useMemo(() => {
    if (!processedData || !activeStudent) return [];

    let filtered = processedData.filter((item) => {
      if (!item[keysMapping.keyNama]) return false;

      const itemKelas = item[keysMapping.keyKelas] || "";
      if (scope === "kelas") return itemKelas === studentKelas;
      if (scope === "jurusan") return getJurusan(itemKelas) === studentJurusan;
      return true; // keseluruhan
    });

    return filtered.sort((a, b) => {
      const valA = parseFloat(a[selectedMapel]) || 0;
      const valB = parseFloat(b[selectedMapel]) || 0;
      return valB - valA;
    });
  }, [
    processedData,
    scope,
    selectedMapel,
    studentKelas,
    studentJurusan,
    keysMapping,
    activeStudent,
  ]);

  // Kalkulasi Rank Siswa Saat Ini
  const myRank = useMemo(() => {
    if (!activeStudent || !sortedData.length) return "-";
    const index = sortedData.findIndex(
      (i) =>
        i[keysMapping.keyNama] === studentNama &&
        i[keysMapping.keyKelas] === studentKelas,
    );
    return index !== -1 ? index + 1 : "-";
  }, [sortedData, activeStudent, keysMapping, studentNama, studentKelas]);

  if (!activeStudent) return null;

  // Batas Maksimal Render untuk Mencegah Browser Lag (Freeze)
  const MAX_RENDER_LIMIT = 50;
  const isMeOutsideTop = myRank !== "-" && myRank > MAX_RENDER_LIMIT;
  const displayData = sortedData.slice(0, MAX_RENDER_LIMIT);

  return (
    <motion.div
      key="sd"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative p-4 md:p-6 pt-10 overflow-hidden z-0 santri-live-bg"
    >
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

      {/* Background Ornamen Melayang */}
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

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* HEADER: Navigasi dan Tab Menu */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo("selection")}
            className="p-3 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-amber-500 hover:bg-white rounded-2xl shadow-sm border border-slate-100/50 flex items-center gap-2 font-bold text-sm"
          >
            <ArrowLeft size={18} /> Keluar
          </motion.button>

          <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl gap-1 border border-white/80 shadow-sm w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setViewMode("nilai")}
              className={`px-4 py-2.5 flex items-center gap-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${viewMode === "nilai" ? "bg-white text-emerald-700 shadow-md scale-105" : "text-slate-600 hover:text-emerald-800 hover:bg-white/40"}`}
            >
              <User size={16} /> Rapor Saya
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`px-4 py-2.5 flex items-center gap-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${viewMode === "stats" ? "bg-white text-emerald-700 shadow-md scale-105" : "text-slate-600 hover:text-emerald-800 hover:bg-white/40"}`}
            >
              <Trophy size={16} /> Peringkat
            </button>
            <button
              onClick={() => setViewMode("race")}
              className={`px-4 py-2.5 flex items-center gap-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${viewMode === "race" ? "bg-white text-emerald-700 shadow-md scale-105" : "text-slate-600 hover:text-emerald-800 hover:bg-white/40"}`}
            >
              <Flag size={16} /> Live Race
            </button>
          </div>
        </div>

        {/* PROFIL SISWA */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/95 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] text-white flex flex-col lg:flex-row items-center gap-6 md:gap-8 shadow-2xl border border-slate-700/50 relative overflow-hidden group"
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

          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl font-black text-slate-900 shadow-xl shadow-amber-500/30 z-10 border-4 border-amber-200/50">
            {studentNama.charAt(0)}
          </div>

          <div className="flex-1 text-center lg:text-left z-10">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 drop-shadow-md">
              {studentNama}
            </h2>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs text-amber-300 font-bold uppercase tracking-widest border border-white/10">
                Kelas {studentKelas}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-lg text-xs text-emerald-300 font-bold uppercase tracking-widest border border-emerald-500/20">
                Jurusan {studentJurusan}
              </span>
            </div>
          </div>

          <div className="flex gap-4 z-10">
            <div className="text-center bg-slate-800/60 p-4 rounded-3xl border border-slate-600/50 backdrop-blur-md min-w-[100px]">
              <div className="text-3xl font-black text-amber-400">
                {activeStudent.RataRata || 0}
              </div>
              <div className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1">
                Rata-Rata
              </div>
            </div>
            {(viewMode === "stats" || viewMode === "race") && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center bg-amber-500/20 p-4 rounded-3xl border border-amber-500/30 backdrop-blur-md min-w-[100px]"
              >
                <div className="text-3xl font-black text-white">#{myRank}</div>
                <div className="text-[9px] text-amber-200 font-black uppercase tracking-widest mt-1">
                  Rank {scope}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* FILTER CONTROL (Hanya untuk Papan Peringkat & Race) */}
        <AnimatePresence>
          {(viewMode === "stats" || viewMode === "race") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl flex border border-slate-200 shadow-sm">
                {[
                  { id: "kelas", label: "Per Kelas" },
                  { id: "jurusan", label: "Per Jurusan" },
                  { id: "keseluruhan", label: "Semua Peserta" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScope(s.id)}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold uppercase transition-all ${scope === s.id ? "bg-slate-900 text-amber-400 shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <select
                className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-slate-700"
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
              >
                <option value="RataRata">Urutkan: Rata-Rata Keseluruhan</option>
                {allMapel.map((m) => (
                  <option key={m} value={m}>
                    Urutkan: {m}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KONTEN UTAMA */}
        <AnimatePresence mode="wait">
          {/* MODE: RAPOR PRIBADI */}
          {viewMode === "nilai" && (
            <motion.div
              key="view-nilai"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {allMapel.map((m) => {
                const nilai = activeStudent[m] || 0;
                return (
                  <motion.div
                    key={m}
                    variants={fadeUp}
                    whileHover={{ y: -5 }}
                    className="bg-white/85 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white hover:border-emerald-200 transition-all overflow-hidden relative"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {m}
                      </span>
                      <span className="text-3xl font-black text-slate-800">
                        {nilai}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200/70 rounded-full overflow-hidden shadow-inner relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nilai}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* MODE: PAPAN PERINGKAT */}
          {viewMode === "stats" && (
            <motion.div
              key="view-stats"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-3"
            >
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 text-sm text-emerald-800">
                <Target size={20} className="shrink-0" />
                <p>
                  Papan Peringkat:{" "}
                  <strong>
                    {scope === "kelas"
                      ? `Kelas ${studentKelas}`
                      : scope === "jurusan"
                        ? `Jurusan ${studentJurusan}`
                        : "Keseluruhan Peserta"}
                  </strong>{" "}
                  - <strong>{selectedMapel}</strong>.
                </p>
              </div>

              {displayData.map((item, idx) => {
                const isMe =
                  item[keysMapping.keyNama] === studentNama &&
                  item[keysMapping.keyKelas] === studentKelas;
                return (
                  <motion.div
                    // Kombinasi Key yang Unik
                    key={`stats-${item[keysMapping.keyNama]}-${item[keysMapping.keyKelas]}`}
                    className={`flex items-center p-4 md:p-5 rounded-[1.5rem] shadow-sm border transition-all ${isMe ? "bg-amber-50 border-amber-300 shadow-md scale-[1.02]" : "bg-white border-slate-100"}`}
                  >
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black mr-4 shadow-inner ${idx === 0 ? "bg-amber-400 text-white text-lg" : idx === 1 ? "bg-slate-200 text-slate-600 text-base" : idx === 2 ? "bg-amber-700/40 text-white text-base" : isMe ? "bg-amber-200 text-amber-800" : "bg-slate-50 text-slate-400"}`}
                    >
                      {idx === 0 ? "🥇" : idx + 1}
                    </div>
                    <div className="flex-1 font-black uppercase text-sm md:text-base tracking-wide">
                      <span
                        className={isMe ? "text-amber-700" : "text-slate-800"}
                      >
                        {item[keysMapping.keyNama]} {isMe && "(SAYA)"}
                      </span>
                      <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
                        KELAS {item[keysMapping.keyKelas]}
                      </div>
                    </div>
                    <div
                      className={`text-right font-black text-xl md:text-2xl drop-shadow-sm ${isMe ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {item[selectedMapel] || 0}
                    </div>
                  </motion.div>
                );
              })}

              {/* Munculkan Siswa di bawah jika rank dia diluar batas render */}
              {isMeOutsideTop && (
                <>
                  <div className="text-center text-slate-400 text-xl font-black py-2">
                    •••
                  </div>
                  <motion.div
                    key="stats-me-bottom"
                    className="flex items-center p-4 md:p-5 rounded-[1.5rem] shadow-md border bg-amber-50 border-amber-300 scale-[1.02] transition-all"
                  >
                    <div className="w-10 h-10 md:w-12 h-12 rounded-xl flex items-center justify-center font-black mr-4 shadow-inner bg-amber-200 text-amber-800">
                      {myRank}
                    </div>
                    <div className="flex-1 font-black uppercase text-sm md:text-base tracking-wide">
                      <span className="text-amber-700">
                        {studentNama} (SAYA)
                      </span>
                      <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
                        KELAS {studentKelas}
                      </div>
                    </div>
                    <div className="text-right font-black text-xl md:text-2xl drop-shadow-sm text-amber-600">
                      {activeStudent[selectedMapel] || 0}
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {/* MODE: LIVE RACE ARENA */}
          {viewMode === "race" && (
            <motion.div
              key="view-race"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-white font-black uppercase tracking-widest text-sm md:text-lg flex items-center gap-2">
                  <Flag className="text-amber-400" /> Race Arena:{" "}
                  {scope.toUpperCase()}
                </h3>
              </div>
              <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto space-y-3">
                {displayData.map((item, idx) => (
                  <RaceItem
                    key={`race-${item[keysMapping.keyNama]}-${item[keysMapping.keyKelas]}`}
                    item={item}
                    idx={idx}
                    selectedMapel={selectedMapel}
                    keysMapping={keysMapping}
                    activeStudentName={studentNama}
                    activeStudentKelas={studentKelas}
                  />
                ))}

                {isMeOutsideTop && (
                  <>
                    <div className="text-center text-slate-500 text-[10px] py-4 font-black tracking-widest uppercase flex items-center justify-center gap-3">
                      <span className="w-10 h-px bg-slate-700"></span>
                      Ayo kejar peringkat atas!
                      <span className="w-10 h-px bg-slate-700"></span>
                    </div>
                    <RaceItem
                      key={`race-me-bottom`}
                      item={activeStudent}
                      idx={myRank - 1}
                      selectedMapel={selectedMapel}
                      keysMapping={keysMapping}
                      activeStudentName={studentNama}
                      activeStudentKelas={studentKelas}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
