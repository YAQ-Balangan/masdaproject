import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Lock,
  Search,
  LogOut,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Filter,
  ClipboardList,
  Trophy,
  BarChart3,
  LayoutGrid,
  Zap,
  Star,
  Target,
  TrendingUp,
  Medal,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// --- KONFIGURASI ---
const API_URL =
  "https://script.google.com/macros/s/AKfycby6RE_Zc2mzQb2l4f9JGWwVhD1iFrmvmYcTuE8f8x8GIYrDBjMOjK82aFNk5cEVOdqIdA/exec";
const GURU_PASSWORD = "guru123";
const DAFTAR_MAPEL_PASTI = [
  "Bahasa Indonesia",
  "Fiqih",
  "Matematika (Wajib)",
  "Akidah Akhlak",
  "Sejarah Indonesia",
  "Quran Hadits",
  "Bahasa Inggris",
  "SKI",
  "Bahasa Arab",
];

// --- VARIANTS ANIMASI (GLOBAL) ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const scaleUpItem = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// --- KOMPONEN ANIMASI ANGKA (SMOOTH TRANSITION) ---
const RollingValue = ({ value, className }) => (
  <div
    className={`relative flex flex-col items-center justify-center overflow-hidden h-[1.5em] ${className}`}
  >
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </div>
);

// --- DASHBOARD GURU (DIPISAH KE LUAR AGAR STABIL) ---
const GuruDashboard = ({
  processedData,
  keysMapping,
  allMapel,
  handleLogout,
  guruMode,
  setGuruMode,
  filters,
  setFilters,
  isSyncing, // Tambahan prop untuk indikator auto-sync
}) => {
  const sortedData = useMemo(() => {
    let f = processedData.filter(
      (i) =>
        (filters.kelas ? i[keysMapping.keyKelas] === filters.kelas : true) &&
        i[keysMapping.keyNama]
          .toLowerCase()
          .includes(filters.search.toLowerCase()),
    );

    const sortKey =
      guruMode === "stats"
        ? filters.mapelStats === ""
          ? "RataRata"
          : filters.mapelStats
        : keysMapping.keyNama;

    return f.sort((a, b) => {
      if (guruMode === "stats")
        return (parseFloat(b[sortKey]) || 0) - (parseFloat(a[sortKey]) || 0);
      return String(a[sortKey]).localeCompare(String(b[sortKey]));
    });
  }, [processedData, filters, guruMode, keysMapping]);

  const displayedCols = filters.mapelTable ? [filters.mapelTable] : allMapel;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20 }}
      variants={staggerContainer}
      className="p-4 md:p-8 max-w-[98vw] mx-auto space-y-8 relative z-10"
    >
      {/* Nav Header */}
      <motion.div
        variants={fadeUpItem}
        className="flex flex-col lg:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-white/50 gap-6"
      >
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-2xl shadow-inner"
          >
            <BookOpen size={30} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
              Monitoring Real-Time
            </h2>
            {/* Indikator Auto-Sync Ringan */}
            <p
              className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors duration-300 ${isSyncing ? "text-amber-500" : "text-emerald-500"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isSyncing ? "bg-amber-500 animate-bounce" : "bg-emerald-500 animate-pulse"}`}
              ></span>
              {isSyncing
                ? "Menyinkronkan Data..."
                : "Sinkronisasi 30 Detik Aktif"}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-2 rounded-[1.5rem] backdrop-blur-sm border border-slate-200/50">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setGuruMode("table")}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 ${guruMode === "table" ? "bg-white shadow-lg shadow-indigo-200/50 text-indigo-600 scale-100" : "text-slate-400 hover:text-slate-600"}`}
          >
            Data Tabel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setGuruMode("stats")}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 ${guruMode === "stats" ? "bg-white shadow-lg shadow-indigo-200/50 text-indigo-600 scale-100" : "text-slate-400 hover:text-slate-600"}`}
          >
            Live Peringkat
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, color: "#ef4444" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest transition-colors"
        >
          <LogOut size={18} /> Keluar
        </motion.button>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          variants={fadeUpItem}
          className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/50 flex items-center shadow-lg shadow-slate-200/20 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all group"
        >
          <Search
            size={20}
            className="text-slate-300 mr-3 group-focus-within:text-indigo-400 transition-colors"
          />
          <input
            type="text"
            placeholder="Cari Nama Santri..."
            className="bg-transparent border-none w-full text-sm font-bold outline-none text-slate-700 placeholder:text-slate-300"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </motion.div>

        <motion.div variants={fadeUpItem} className="relative group">
          <Filter
            size={16}
            className="absolute left-5 top-[1.1rem] text-slate-300 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
          />
          <select
            className="w-full bg-white/80 backdrop-blur-md p-4 pl-12 rounded-3xl border border-white/50 text-sm font-bold text-slate-600 shadow-lg shadow-slate-200/20 appearance-none outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all cursor-pointer"
            value={filters.kelas}
            onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
          >
            <option value="">Semua Kelas</option>
            {[...new Set(processedData.map((i) => i[keysMapping.keyKelas]))]
              .filter(Boolean)
              .sort()
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <ChevronRight
            size={16}
            className="absolute right-5 top-[1.1rem] text-slate-300 rotate-90 pointer-events-none"
          />
        </motion.div>

        <motion.div variants={fadeUpItem} className="relative group">
          <BookOpen
            size={16}
            className="absolute left-5 top-[1.1rem] text-slate-300 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
          />
          <select
            className="w-full bg-white/80 backdrop-blur-md p-4 pl-12 rounded-3xl border border-white/50 text-sm font-bold text-slate-600 shadow-lg shadow-slate-200/20 appearance-none outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all cursor-pointer"
            value={
              guruMode === "table" ? filters.mapelTable : filters.mapelStats
            }
            onChange={(e) =>
              guruMode === "table"
                ? setFilters({ ...filters, mapelTable: e.target.value })
                : setFilters({ ...filters, mapelStats: e.target.value })
            }
          >
            <option value="">
              {guruMode === "table"
                ? "Tampilkan Semua Mapel"
                : "Urut Berdasarkan Rata-rata"}
            </option>
            {allMapel.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <ChevronRight
            size={16}
            className="absolute right-5 top-[1.1rem] text-slate-300 rotate-90 pointer-events-none"
          />
        </motion.div>
      </motion.div>

      <LayoutGroup>
        {guruMode === "table" ? (
          <motion.div
            key="table-view"
            variants={fadeUpItem}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-indigo-100/40 border border-white overflow-hidden"
          >
            <div className="overflow-x-auto max-h-[60vh] scrollbar-hide">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 z-20">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      No
                    </th>
                    <th className="p-6 text-[10px] font-black text-white uppercase tracking-widest">
                      Identitas Santri
                    </th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Kelas
                    </th>
                    {displayedCols.map((m) => (
                      <th
                        key={m}
                        className="p-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center"
                      >
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-slate-100/50"
                >
                  <AnimatePresence>
                    {sortedData.map((item, idx) => (
                      <motion.tr
                        // HAPUS PROP 'layout' DI SINI
                        variants={fadeUpItem}
                        key={`${item[keysMapping.keyNama]}-${idx}`}
                        whileHover={{
                          backgroundColor: "rgba(238, 242, 255, 0.6)",
                          scale: 0.995,
                        }}
                        className="transition-colors group"
                      >
                        <td className="p-6 text-sm text-center text-slate-300 font-bold group-hover:text-indigo-400 transition-colors">
                          {idx + 1}
                        </td>
                        <td className="p-6 font-black text-slate-800 text-base uppercase group-hover:text-indigo-700 transition-colors">
                          {item[keysMapping.keyNama]}
                        </td>
                        <td className="p-6 text-center">
                          <span className="px-4 py-1.5 bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors rounded-full text-[10px] font-black">
                            {item[keysMapping.keyKelas]}
                          </span>
                        </td>
                        {displayedCols.map((m) => (
                          <td
                            key={m}
                            className="p-6 text-sm text-center font-black text-slate-600"
                          >
                            <RollingValue
                              value={item[m] !== undefined ? item[m] : "-"}
                            />
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stats-view"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedData.slice(0, 10).map((item, idx) => (
                  <motion.div
                    layout
                    variants={scaleUpItem}
                    key={item[keysMapping.keyNama]}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`flex items-center p-6 bg-white/90 backdrop-blur-xl rounded-[2rem] border shadow-lg hover:shadow-xl transition-shadow ${idx < 3 ? "border-amber-200/50 shadow-amber-100/30 ring-1 ring-amber-100" : "border-white shadow-slate-200/30"}`}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mr-6 ${idx === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shadow-amber-300/40" : idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-300/40" : idx === 2 ? "bg-gradient-to-br from-amber-700/40 to-amber-800/40 text-amber-900 shadow-lg" : "bg-slate-50 text-slate-400"}`}
                    >
                      {idx === 0 ? (
                        <Medal size={28} className="drop-shadow-md" />
                      ) : (
                        idx + 1
                      )}
                    </motion.div>
                    <div className="flex-1 font-black text-slate-800 text-lg uppercase tracking-tight">
                      {item[keysMapping.keyNama]}
                      <div className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">
                        KELAS {item[keysMapping.keyKelas]}
                      </div>
                    </div>
                    <div className="text-right">
                      <RollingValue
                        value={
                          filters.mapelStats === ""
                            ? item.RataRata
                            : item[filters.mapelStats] || 0
                        }
                        className={`text-4xl font-black tracking-tighter ${idx === 0 ? "text-amber-500" : "text-indigo-600"}`}
                      />
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">
                        POINTS
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div
              variants={fadeUpItem}
              className="space-y-6 sticky top-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute right-[-40px] bottom-[-40px] opacity-10 group-hover:opacity-20 transition-opacity"
                >
                  <Zap size={220} />
                </motion.div>

                <div className="relative z-10">
                  <h4 className="text-xs font-black text-indigo-100 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <TrendingUp size={16} /> Rata-rata Group
                  </h4>
                  <RollingValue
                    className="text-7xl font-black tracking-tighter drop-shadow-lg"
                    value={(
                      sortedData.reduce(
                        (acc, curr) =>
                          acc +
                          (parseFloat(
                            curr[
                              filters.mapelStats === ""
                                ? "RataRata"
                                : filters.mapelStats
                            ],
                          ) || 0),
                        0,
                      ) / (sortedData.length || 1)
                    ).toFixed(1)}
                  />
                  <div className="mt-6 inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold border border-white/20">
                    Statistik Keseluruhan
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </LayoutGroup>
    </motion.div>
  );
};

// --- KOMPONEN UTAMA ---
export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // State untuk sinkronisasi background
  const [view, setView] = useState("selection");
  const [currentUserName, setCurrentUserName] = useState(null); // Hanya simpan nama, bukan seluruh object statis
  const [guruMode, setGuruMode] = useState("table");
  const [filters, setFilters] = useState({
    search: "",
    kelas: "",
    mapelTable: "",
    mapelStats: "",
  });

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsSyncing(true); // Indikator ringan saat fetch background
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      if (isInitial) setLoading(false);
      else setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // Auto-sync 30 Detik
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const keysMapping = useMemo(() => {
    if (!data.length) return { keyNama: "Nama", keyKelas: "Kelas" };
    const keys = Object.keys(data[0]);
    return {
      keyNama: keys.find((k) => k.toLowerCase().includes("nama")) || "Nama",
      keyKelas: keys.find((k) => k.toLowerCase().includes("kelas")) || "Kelas",
      keyMapelRaw: keys.find(
        (k) =>
          k.toLowerCase() === "mapel" ||
          k.toLowerCase().includes("mata pelajaran"),
      ),
      keyNilaiRaw: keys.find(
        (k) => k.toLowerCase() === "nilai" || k.toLowerCase() === "score",
      ),
    };
  }, [data]);

  // Kalkulasi data akan re-run jika ada data baru masuk dari interval sync
  const processedData = useMemo(() => {
    if (!data.length) return [];
    const { keyNama, keyKelas, keyMapelRaw, keyNilaiRaw } = keysMapping;
    const grouped = {};
    data.forEach((row) => {
      // Perbaikan: Gunakan .trim() agar nama tidak duplikat karena spasi
      const nama = row[keyNama]?.toString().trim();
      const kelas = row[keyKelas]?.toString().trim() || "";

      if (!nama) return;
      if (!grouped[nama])
        grouped[nama] = {
          [keyNama]: nama,
          [keyKelas]: kelas,
          Total: 0,
          Count: 0,
        };
      if (keyMapelRaw && keyNilaiRaw && row[keyMapelRaw]) {
        const mName = row[keyMapelRaw].trim();
        const mVal = parseFloat(row[keyNilaiRaw]) || 0;
        grouped[nama][mName] = mVal;
        grouped[nama].Total += mVal;
        grouped[nama].Count += 1;
      } else {
        Object.keys(row).forEach((k) => {
          if (
            ![keyNama, keyKelas, "Total", "Count", "RataRata"].includes(k) &&
            row[k] !== ""
          ) {
            const val = parseFloat(row[k]) || 0;
            grouped[nama][k.trim()] = val;
            grouped[nama].Total += val;
            grouped[nama].Count += 1;
          }
        });
      }
    });
    return Object.values(grouped).map((s) => ({
      ...s,
      RataRata: s.Count ? (s.Total / s.Count).toFixed(1) : 0,
    }));
  }, [data, keysMapping]);

  const allMapel = useMemo(() => {
    const mSet = new Set(DAFTAR_MAPEL_PASTI);
    processedData.forEach((i) =>
      Object.keys(i).forEach((k) => {
        if (
          ![
            keysMapping.keyNama,
            keysMapping.keyKelas,
            "Total",
            "Count",
            "RataRata",
          ].includes(k)
        )
          mSet.add(k);
      }),
    );
    return Array.from(mSet);
  }, [processedData, keysMapping]);

  // Derive activeStudent dynamically so Santri Dashboard auto-syncs without manual refresh
  const activeStudent = useMemo(() => {
    if (!currentUserName || !processedData.length) return null;
    return processedData.find(
      (s) => s[keysMapping.keyNama] === currentUserName,
    );
  }, [processedData, currentUserName, keysMapping]);

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans text-slate-900 overflow-x-hidden relative selection:bg-indigo-200 selection:text-indigo-900">
      {/* Background Animated Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 40, -10, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-400/20 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-[8px] border-slate-100 border-t-indigo-600 rounded-full shadow-2xl shadow-indigo-200/50"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute"
              >
                <GraduationCap className="w-10 h-10 text-indigo-600 drop-shadow-md" />
              </motion.div>
            </div>
            <motion.h2
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-12 font-black text-indigo-900 tracking-[0.4em] text-sm uppercase"
            >
              Sinkronisasi Data...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {view === "selection" && (
            <motion.div
              key="selection"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              className="flex flex-col items-center justify-center min-h-[90vh] px-6"
            >
              <motion.div
                variants={scaleUpItem}
                className="relative mb-8 group cursor-default"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-white"
                >
                  <GraduationCap className="w-16 h-16 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                </motion.div>
                <div className="absolute inset-0 bg-indigo-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity -z-10 rounded-full"></div>
              </motion.div>

              <motion.h1
                variants={fadeUpItem}
                className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 text-center drop-shadow-sm"
              >
                Portal Akademik
                <span className="text-indigo-600 animate-pulse">.</span>
              </motion.h1>
              <motion.p
                variants={fadeUpItem}
                className="text-slate-500 font-bold max-w-sm mx-auto text-center text-lg leading-relaxed mb-12"
              >
                Sistem integrasi nilai real-time & statistik interaktif.
              </motion.p>

              <motion.div
                variants={staggerContainer}
                className="grid gap-6 w-full max-w-md"
              >
                <motion.button
                  variants={fadeUpItem}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("login-guru")}
                  className="group relative p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-900/30 overflow-hidden text-left border border-slate-800"
                >
                  <div className="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 pointer-events-none">
                    <Lock size={150} />
                  </div>
                  <div className="relative flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-indigo-500 transition-colors">
                      <Lock size={28} />
                    </div>
                    <div>
                      <span className="block font-black text-2xl tracking-tight mb-1">
                        Akses Pendidik
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-indigo-200 transition-colors">
                        Manajemen Dashboard
                      </span>
                    </div>
                    <ChevronRight className="ml-auto text-slate-600 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </div>
                </motion.button>

                <motion.button
                  variants={fadeUpItem}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("login-santri")}
                  className="group relative p-8 bg-white/90 backdrop-blur-xl border border-white rounded-[2.5rem] text-slate-800 shadow-xl shadow-slate-200/50 overflow-hidden text-left"
                >
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-[0.08] group-hover:-rotate-12 group-hover:scale-125 transition-all duration-500 pointer-events-none">
                    <Search size={150} />
                  </div>
                  <div className="relative flex items-center gap-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                      <Search size={28} />
                    </div>
                    <div>
                      <span className="block font-black text-2xl tracking-tight mb-1">
                        Portal Santri
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                        Cek Nilai Mandiri
                      </span>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {view === "login-guru" && (
            <motion.div
              key="login-guru"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-md mx-auto mt-[10vh] p-12 bg-white/90 backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-indigo-200/40 border border-white text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-900 to-slate-700"></div>
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-20 h-20 bg-slate-50 text-slate-800 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100"
              >
                <Lock size={32} />
              </motion.div>
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">
                Security Check
              </h2>
              <div className="group relative mb-6">
                <input
                  type="password"
                  autoFocus
                  placeholder="Password Admin"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.target.value === GURU_PASSWORD
                      ? setView("guru-dashboard")
                      : alert("Wrong Password!"))
                  }
                  className="w-full p-6 rounded-2xl bg-slate-50/50 backdrop-blur-sm border-2 border-slate-100 outline-none focus:border-indigo-400 focus:bg-white font-black text-center text-lg transition-all shadow-inner"
                />
                <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300 pointer-events-none -z-10"></div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("selection")}
                className="mt-4 px-6 py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-full"
              >
                Batalkan
              </motion.button>
            </motion.div>
          )}

          {view === "login-santri" && (
            <motion.div
              key="login-santri"
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-md mx-auto mt-[10vh] p-12 bg-white/90 backdrop-blur-xl rounded-[3.5rem] shadow-2xl shadow-indigo-200/40 border border-white text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              <motion.div
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-100/50"
              >
                <Search size={32} />
              </motion.div>
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">
                Pencarian Santri
              </h2>
              <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-widest">
                Masukkan Nama Lengkap Sesuai Absen
              </p>
              <div className="group relative mb-6">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nama Lengkap..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const found = processedData.find((s) =>
                        s[keysMapping.keyNama]
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase()),
                      );
                      found
                        ? (setCurrentUserName(found[keysMapping.keyNama]),
                          setView("santri-dashboard"))
                        : alert("Data Tidak Ditemukan!");
                    }
                  }}
                  className="w-full p-6 rounded-2xl bg-slate-50/50 backdrop-blur-sm border-2 border-slate-100 outline-none focus:border-indigo-400 focus:bg-white font-black text-center text-lg transition-all shadow-inner"
                />
                <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-focus-within:opacity-100 group-focus-within:scale-105 transition-all duration-300 pointer-events-none -z-10"></div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("selection")}
                className="mt-4 px-6 py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 rounded-full"
              >
                Kembali Ke Beranda
              </motion.button>
            </motion.div>
          )}

          {view === "guru-dashboard" && (
            <GuruDashboard
              key="guru-main-comp"
              processedData={processedData}
              keysMapping={keysMapping}
              allMapel={allMapel}
              guruMode={guruMode}
              setGuruMode={setGuruMode}
              filters={filters}
              setFilters={setFilters}
              isSyncing={isSyncing} // Pass state sinkronisasi ke komponen
              handleLogout={() => {
                setView("selection");
                setCurrentUserName(null);
              }}
            />
          )}

          {view === "santri-dashboard" && activeStudent && (
            <motion.div
              key="santri-main-comp"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 40 }}
              className="max-w-4xl mx-auto p-4 md:p-12 space-y-10 relative z-10"
            >
              {/* Header Santri dengan indikator Live Sync */}
              <motion.div
                variants={fadeUpItem}
                className="flex justify-between items-center mb-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setView("selection");
                    setCurrentUserName(null);
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all bg-white/50 backdrop-blur-md px-5 py-3 rounded-full shadow-sm"
                >
                  <ArrowLeft size={18} /> Kembali
                </motion.button>

                <div
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm transition-colors duration-300 ${isSyncing ? "text-amber-600" : "text-emerald-600"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isSyncing ? "bg-amber-500 animate-bounce" : "bg-emerald-500 animate-pulse"}`}
                  ></span>
                  {isSyncing ? "Menyinkronkan..." : "Live Sync Aktif"}
                </div>
              </motion.div>

              <motion.div
                variants={scaleUpItem}
                className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group"
              >
                {/* ID Card Background Effects */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-[-40px] right-[-40px] w-80 h-80 bg-indigo-600/30 rounded-full blur-[80px] pointer-events-none"
                />
                <motion.div
                  animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute bottom-[-100px] left-[-20px] w-64 h-64 bg-violet-600/30 rounded-full blur-[70px] pointer-events-none"
                />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-32 h-32 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/10 uppercase"
                    >
                      {activeStudent[keysMapping.keyNama].charAt(0)}
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -bottom-3 -right-3 bg-emerald-400 p-3 rounded-2xl border-4 border-slate-900 shadow-xl"
                    >
                      <Zap
                        size={20}
                        className="text-slate-900 fill-slate-900"
                      />
                    </motion.div>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 drop-shadow-sm">
                      {activeStudent[keysMapping.keyNama]}
                    </h2>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-inner">
                        Kls {activeStudent[keysMapping.keyKelas]}
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 backdrop-blur-md px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-400/20 shadow-inner">
                        Santri Aktif
                      </span>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 text-center min-w-[160px] shadow-2xl"
                  >
                    <RollingValue
                      value={activeStudent.RataRata}
                      className="text-5xl font-black text-indigo-300 tracking-tighter drop-shadow-md"
                    />
                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                      Indeks Prestasi
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {allMapel.map((m, i) => {
                    const val = activeStudent[m] || 0;
                    return (
                      <motion.div
                        variants={fadeUpItem}
                        layout
                        key={m}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 group overflow-hidden relative cursor-default"
                      >
                        <motion.div className="absolute -top-4 -right-4 p-3 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-500 group-hover:rotate-12 pointer-events-none">
                          <BookOpen size={100} />
                        </motion.div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 transition-colors shadow-sm">
                            <ClipboardList size={24} />
                          </div>
                          <RollingValue
                            value={val}
                            className={`text-4xl font-black tracking-tighter drop-shadow-sm ${val >= 75 ? "text-slate-800" : "text-rose-500"}`}
                          />
                        </div>

                        <div className="relative z-10">
                          <h4 className="font-black text-slate-500 text-xs uppercase tracking-widest mb-4 truncate group-hover:text-indigo-600 transition-colors">
                            {m}
                          </h4>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{
                                duration: 1.5,
                                type: "spring",
                                bounce: 0.4,
                              }}
                              className={`h-full relative overflow-hidden ${val >= 75 ? "bg-gradient-to-r from-indigo-400 to-indigo-600" : "bg-gradient-to-r from-rose-400 to-rose-600"}`}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shimmer Keyframes untuk Progress Bar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
          0% { transform: translateX(-100%); }
        }
      `,
        }}
      />
    </div>
  );
}
