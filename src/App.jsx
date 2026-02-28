import React, { useState, useEffect, useMemo, memo } from "react";
import {
  User,
  Lock,
  Search,
  LogOut,
  BookOpen,
  GraduationCap,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Filter,
  ClipboardList,
  Trophy,
  LayoutGrid,
  Zap,
  Star,
  Target,
  TrendingUp,
  Medal,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- KONFIGURASI ---
const API_URL =
  "https://script.google.com/macros/s/AKfycby6RE_Zc2mzQb2l4f9JGWwVhD1iFrmvmYcTuE8f8x8GIYrDBjMOjK82aFNk5cEVOdqIdA/exec";
const GURU_PASSWORD = "123";
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

// --- OPTIMASI 1: Komponen Angka yang Lebih Ringan ---
const RollingValue = memo(({ value, className }) => (
  <div
    className={`relative flex flex-col items-center justify-center overflow-hidden h-[1.2em] ${className}`}
  >
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </div>
));

// --- OPTIMASI 2: Race View yang Lebih Ringan (Memoized) ---
const RaceItem = memo(({ item, idx, selectedMapel, keysMapping }) => {
  const rawVal = item[selectedMapel];
  const nilai = typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
  const isFinished = nilai > 0;

  const namaKelas = item[keysMapping.keyKelas].toString().toUpperCase();
  const isMipa = namaKelas.includes("MIPA") || namaKelas.includes("IPA");
  const labelColor = isMipa
    ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
    : "text-amber-400 bg-amber-400/10 border-amber-400/20";

  return (
    <div className="flex items-center gap-4 group relative py-1">
      <div
        className={`w-32 md:w-48 shrink-0 px-3 py-2 rounded-xl border text-[10px] font-black uppercase truncate ${labelColor}`}
      >
        {idx + 1}. {item[keysMapping.keyNama]}
      </div>
      <div className="flex-1 h-7 bg-slate-800/50 rounded-full relative overflow-hidden border border-slate-700/50">
        {/* CSS Transition lebih ringan daripada motion.div untuk progress bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isMipa ? "bg-cyan-500/30" : "bg-amber-500/30"}`}
          style={{ width: `${nilai}%` }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-xl"
          animate={{ left: `${nilai * 0.9}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
        >
          <div className="relative">
            {nilai === 100
              ? "👑"
              : nilai >= 90
                ? "⚡"
                : isFinished
                  ? "🏃"
                  : "🧍"}
            {isFinished && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white bg-slate-900 px-1 rounded border border-slate-700">
                {nilai}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
});

const RaceView = ({ sortedData, selectedMapel, keysMapping }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-700 overflow-hidden"
  >
    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
      <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
        <Flag className="text-emerald-400" /> Live Race Arena
      </h3>
    </div>
    <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-2">
      {sortedData.map((item, idx) => (
        <RaceItem
          key={item[keysMapping.keyNama]}
          item={item}
          idx={idx}
          selectedMapel={selectedMapel}
          keysMapping={keysMapping}
        />
      ))}
    </div>
  </motion.div>
);

// --- DASHBOARD GURU ---
const GuruDashboard = ({
  processedData,
  keysMapping,
  allMapel,
  handleLogout,
  guruMode,
  setGuruMode,
  filters,
  setFilters,
  isSyncing,
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
      guruMode === "stats" || guruMode === "race"
        ? filters.mapelStats || "RataRata"
        : keysMapping.keyNama;
    return f.sort((a, b) =>
      guruMode === "stats" || guruMode === "race"
        ? (parseFloat(b[sortKey]) || 0) - (parseFloat(a[sortKey]) || 0)
        : String(a[sortKey]).localeCompare(String(b[sortKey])),
    );
  }, [processedData, filters, guruMode, keysMapping]);

  const displayedCols = filters.mapelTable
    ? [filters.mapelTable]
    : allMapel.slice(0, 5); // Batasi kolom jika banyak

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-center bg-white/80 p-6 rounded-[2rem] shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Monitoring Real-Time
            </h2>
            <p
              className={`text-[10px] font-black uppercase ${isSyncing ? "text-amber-500" : "text-emerald-500"}`}
            >
              {isSyncing ? "Syncing..." : "Live Active"}
            </p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {["table", "stats", "race"].map((m) => (
            <button
              key={m}
              onClick={() => setGuruMode(m)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${guruMode === m ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 font-black text-[10px] uppercase flex items-center gap-2"
        >
          <LogOut size={16} /> Keluar
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Cari Nama..."
          className="p-4 rounded-2xl bg-white border-none shadow-sm text-sm font-bold"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="p-4 rounded-2xl bg-white border-none shadow-sm text-sm font-bold appearance-none"
          value={filters.kelas}
          onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
        >
          <option value="">Semua Kelas</option>
          {[...new Set(processedData.map((i) => i[keysMapping.keyKelas]))]
            .sort()
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
        <select
          className="p-4 rounded-2xl bg-white border-none shadow-sm text-sm font-bold appearance-none"
          value={guruMode === "table" ? filters.mapelTable : filters.mapelStats}
          onChange={(e) =>
            guruMode === "table"
              ? setFilters({ ...filters, mapelTable: e.target.value })
              : setFilters({ ...filters, mapelStats: e.target.value })
          }
        >
          <option value="">
            {guruMode === "table" ? "Semua Mapel" : "Urutkan Rata-rata"}
          </option>
          {allMapel.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {guruMode === "table" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[2rem] shadow-xl overflow-hidden overflow-x-auto"
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] uppercase font-black">
                <tr>
                  <th className="p-4 text-center">No</th>
                  <th className="p-4">Nama Santri</th>
                  <th className="p-4 text-center">Kelas</th>
                  {displayedCols.map((m) => (
                    <th key={m} className="p-4 text-center">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-indigo-50/50 transition-colors"
                  >
                    <td className="p-4 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-4 text-sm font-black text-slate-800 uppercase">
                      {item[keysMapping.keyNama]}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black">
                        {item[keysMapping.keyKelas]}
                      </span>
                    </td>
                    {displayedCols.map((m) => (
                      <td key={m} className="p-4 text-center text-sm font-bold">
                        <RollingValue value={item[m] || "-"} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        {guruMode === "stats" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {sortedData.slice(0, 10).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-white"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mr-4 ${idx === 0 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 font-black text-slate-800 uppercase text-sm">
                  {item[keysMapping.keyNama]}
                </div>
                <div className="text-right font-black text-indigo-600 text-xl">
                  {item[filters.mapelStats || "RataRata"]}
                </div>
              </div>
            ))}
          </motion.div>
        )}
        {guruMode === "race" && (
          <RaceView
            sortedData={sortedData}
            selectedMapel={filters.mapelStats || "RataRata"}
            keysMapping={keysMapping}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- KOMPONEN UTAMA ---
export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [view, setView] = useState("selection");
  const [currentUserName, setCurrentUserName] = useState(null);
  const [guruMode, setGuruMode] = useState("table");
  const [filters, setFilters] = useState({
    search: "",
    kelas: "",
    mapelTable: "",
    mapelStats: "",
  });

  const fetchData = async (isInitial = false) => {
    if (isSyncing) return;
    if (isInitial) setLoading(true);
    else setIsSyncing(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
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

  const processedData = useMemo(() => {
    if (!data.length) return [];
    const { keyNama, keyKelas, keyMapelRaw, keyNilaiRaw } = keysMapping;
    const grouped = {};
    data.forEach((row) => {
      const nama = row[keyNama]?.toString().trim();
      if (!nama) return;
      if (!grouped[nama])
        grouped[nama] = {
          [keyNama]: nama,
          [keyKelas]: row[keyKelas] || "",
          Total: 0,
          Count: 0,
        };

      if (keyMapelRaw && row[keyMapelRaw]) {
        const val = parseFloat(row[keyNilaiRaw]) || 0;
        grouped[nama][row[keyMapelRaw].trim()] = val;
        grouped[nama].Total += val;
        grouped[nama].Count += 1;
      } else {
        Object.keys(row).forEach((k) => {
          if (
            ![keyNama, keyKelas, "Total", "Count"].includes(k) &&
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

  const activeStudent = useMemo(
    () =>
      currentUserName
        ? processedData.find((s) => s[keysMapping.keyNama] === currentUserName)
        : null,
    [processedData, currentUserName, keysMapping],
  );

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans text-slate-900 overflow-x-hidden">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "selection" && (
          <motion.div
            key="sel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <GraduationCap className="w-16 h-16 text-indigo-600 mb-6" />
            <h1 className="text-4xl font-black text-center mb-12">
              Portal Akademik<span className="text-indigo-600">.</span>
            </h1>
            <div className="grid gap-4 w-full max-w-sm">
              <button
                onClick={() => setView("login-guru")}
                className="p-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl"
              >
                Akses Guru
              </button>
              <button
                onClick={() => setView("login-santri")}
                className="p-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl"
              >
                Portal Santri
              </button>
            </div>
          </motion.div>
        )}

        {view === "login-guru" && (
          <motion.div
            key="lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] shadow-2xl text-center"
          >
            <Lock className="w-12 h-12 mx-auto mb-6 text-slate-800" />
            <input
              type="password"
              placeholder="Password Admin"
              autoFocus
              className="w-full p-4 rounded-xl bg-slate-100 mb-4 text-center font-bold outline-none"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.target.value === GURU_PASSWORD
                  ? setView("guru-dashboard")
                  : alert("Salah!"))
              }
            />
            <button
              onClick={() => setView("selection")}
              className="text-xs font-black text-slate-400 uppercase"
            >
              Batal
            </button>
          </motion.div>
        )}

        {view === "login-santri" && (
          <motion.div
            key="ls"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[3rem] shadow-2xl text-center"
          >
            <Search className="w-12 h-12 mx-auto mb-6 text-indigo-600" />
            <input
              type="text"
              placeholder="Nama Lengkap..."
              autoFocus
              className="w-full p-4 rounded-xl bg-slate-100 mb-4 text-center font-bold outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const f = processedData.find((s) =>
                    s[keysMapping.keyNama]
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase()),
                  );
                  f
                    ? (setCurrentUserName(f[keysMapping.keyNama]),
                      setView("santri-dashboard"))
                    : alert("Tidak Ada!");
                }
              }}
            />
            <button
              onClick={() => setView("selection")}
              className="text-xs font-black text-slate-400 uppercase"
            >
              Batal
            </button>
          </motion.div>
        )}

        {view === "guru-dashboard" && (
          <GuruDashboard
            processedData={processedData}
            keysMapping={keysMapping}
            allMapel={allMapel}
            guruMode={guruMode}
            setGuruMode={setGuruMode}
            filters={filters}
            setFilters={setFilters}
            isSyncing={isSyncing}
            handleLogout={() => setView("selection")}
          />
        )}

        {view === "santri-dashboard" && activeStudent && (
          <motion.div
            key="sd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto p-6 space-y-6"
          >
            <button
              onClick={() => setView("selection")}
              className="p-3 bg-white rounded-full shadow-sm"
            >
              <ArrowLeft />
            </button>
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-6 shadow-2xl">
              <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-black">
                {activeStudent[keysMapping.keyNama].charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black uppercase">
                  {activeStudent[keysMapping.keyNama]}
                </h2>
                <span className="text-xs text-indigo-300 font-bold uppercase tracking-widest">
                  Kelas {activeStudent[keysMapping.keyKelas]}
                </span>
              </div>
              <div className="text-center bg-white/10 p-4 rounded-2xl">
                <div className="text-3xl font-black text-indigo-300">
                  {activeStudent.RataRata}
                </div>
                <div className="text-[8px] font-black uppercase">
                  IP Rata-rata
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allMapel.map((m) => (
                <div
                  key={m}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-white"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {m}
                    </span>
                    <span className="text-2xl font-black text-slate-800">
                      {activeStudent[m] || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-1000"
                      style={{ width: `${activeStudent[m] || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
