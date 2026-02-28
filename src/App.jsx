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
  Printer,
  Download,
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

// --- ANIMATION VARIANTS (Aman & Ringan) ---
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// --- OPTIMASI 1: Komponen Angka yang Lebih Ringan ---
const RollingValue = memo(({ value, className }) => (
  <div
    className={`relative flex flex-col items-center justify-center overflow-hidden h-[1.2em] ${className}`}
  >
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -15, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
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

  // TEMA LOGO: Hijau (Emerald) & Emas (Amber)
  const labelColor = isMipa
    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    : "text-amber-400 bg-amber-400/10 border-amber-400/20";

  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-4 group relative py-1"
    >
      <div
        className={`w-32 md:w-48 shrink-0 px-3 py-2 rounded-xl border text-[10px] font-black uppercase truncate ${labelColor}`}
      >
        {idx + 1}. {item[keysMapping.keyNama]}
      </div>
      <div className="flex-1 h-7 bg-slate-800/50 rounded-full relative overflow-hidden border border-slate-700/50">
        <div
          className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isMipa ? "bg-emerald-500/40" : "bg-amber-500/40"}`}
          style={{ width: `${nilai}%` }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-xl drop-shadow-md"
          animate={{ left: `${nilai * 0.9}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
        >
          <div className="relative hover:scale-125 transition-transform cursor-pointer">
            {nilai === 100
              ? "🏆"
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
    </motion.div>
  );
});

const RaceView = ({ sortedData, selectedMapel, keysMapping }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl"
  >
    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
      <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
        <Flag className="text-amber-400" /> Live Race Arena
      </h3>
    </div>
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-2"
    >
      {sortedData.map((item, idx) => (
        <RaceItem
          key={item[keysMapping.keyNama]}
          item={item}
          idx={idx}
          selectedMapel={selectedMapel}
          keysMapping={keysMapping}
        />
      ))}
    </motion.div>
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

  const displayedCols = filters.mapelTable ? [filters.mapelTable] : allMapel;

  const handleExport = (type) => {
    if (type === "print" || type === "pdf") {
      window.print();
      return;
    }

    const table = document.getElementById("data-table-guru");
    if (!table) return;

    // Persiapan tabel murni
    const cloneTable = table.cloneNode(true);
    cloneTable.removeAttribute("class");
    cloneTable.style.width = "100%";
    cloneTable.style.borderCollapse = "collapse";
    cloneTable.style.fontFamily = "Arial, sans-serif";

    // LOGIKA DINAMIS: Jika mapel sedikit (<=2 kolom tambahan), font dibesarkan
    const isFewCols = displayedCols.length <= 2;
    cloneTable.style.fontSize = isFewCols ? "12px" : "8px";

    const ths = cloneTable.querySelectorAll("th");
    ths.forEach((th) => {
      th.removeAttribute("class");
      th.style.border = "1px solid black";
      th.style.padding = isFewCols ? "8px" : "2px";
      th.style.backgroundColor = "#e2e8f0";
      th.style.fontWeight = "bold";
      th.style.textAlign = "center";
      th.style.wordBreak = "break-word";

      const text = th.innerText.trim();
      if (text === "No") th.style.width = isFewCols ? "5%" : "3%";
      else if (text === "Nama Santri")
        th.style.width = isFewCols ? "40%" : "17%";
      else if (text === "Kelas") th.style.width = isFewCols ? "15%" : "5%";
      else th.style.width = "auto";
    });

    const tds = cloneTable.querySelectorAll("td");
    tds.forEach((td) => {
      td.removeAttribute("class");
      td.style.border = "1px solid black";
      td.style.padding = isFewCols ? "8px" : "2px";
      const val = td.innerText.trim();
      td.innerHTML = val;
    });

    let officeType =
      type === "xls" ? "excel" : type === "doc" ? "word" : "powerpoint";

    // LOGIKA DINAMIS: Hapus kuncian ukuran kertas A4 agar bebas diprint kertas apa saja
    const wordStyles =
      type === "doc"
        ? `
      <style>
        @page Section1 { mso-page-orientation: landscape; margin: 30.0pt; }
        div.Section1 { page: Section1; }
      </style>
    `
        : "";

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:${officeType}">
      <head>
        <meta charset="utf-8">
        ${wordStyles}
      </head>
      <body>
        <div class="Section1">
          <h2 style="text-align:center; font-family:Arial; font-size:16px; text-transform:uppercase;">Rekapitulasi Nilai Akademik</h2>
          ${cloneTable.outerHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type:
        type === "xls"
          ? "application/vnd.ms-excel"
          : type === "doc"
            ? "application/msword"
            : "application/vnd.ms-powerpoint",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Nilai_Santri.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PENTING: Tag Root adalah div biasa agar tidak Crash (White Screen)
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-full">
      <style type="text/css">
        {`
          @media print {
            @page { margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            ::-webkit-scrollbar { display: none !important; }
          }
        `}
      </style>

      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 gap-4 print:hidden"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Monitoring Real-Time
            </h2>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${isSyncing ? "text-amber-500 animate-pulse" : "text-emerald-500"}`}
            >
              {isSyncing ? "Syncing Data..." : "Live Active"}
            </p>
          </div>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 border border-slate-100 shadow-inner">
          {["table", "stats", "race"].map((m) => (
            <button
              key={m}
              onClick={() => setGuruMode(m)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${guruMode === m ? "bg-white text-emerald-600 shadow-md scale-105" : "text-slate-400 hover:text-slate-600"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 font-black text-[10px] uppercase flex items-center gap-2 transition-colors"
        >
          <LogOut size={16} /> Keluar
        </button>
      </motion.header>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden"
      >
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari Nama Santri..."
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
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
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
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
      </motion.div>

      <AnimatePresence mode="wait">
        {guruMode === "table" && (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col print:shadow-none print:rounded-none print:border-none"
          >
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-end print:hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-auto hidden sm:block">
                Aksi Cetak Dokumen:
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport("print")}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
              >
                <Printer size={14} /> Print
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
              >
                <Download size={14} /> PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport("xls")}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
              >
                <Download size={14} /> XLS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport("doc")}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
              >
                <Download size={14} /> DOCX
              </motion.button>
            </div>

            <div className="overflow-x-auto print:overflow-visible print:w-full">
              <table
                id="data-table-guru"
                className="w-full text-left border-collapse min-w-max print:min-w-0 print:w-full print:table-fixed"
              >
                <thead
                  className={`bg-slate-900 text-white uppercase font-black whitespace-nowrap transition-all print:bg-slate-200 print:text-black print:leading-tight ${displayedCols.length > 2 ? "text-[9px] md:text-[10px] print:text-[6px]" : "text-xs md:text-sm print:text-xs"}`}
                >
                  <tr>
                    <th
                      className={`px-2 py-4 text-center sticky left-0 bg-slate-900 z-10 w-[2.5rem] min-w-[2.5rem] md:w-[3rem] md:min-w-[3rem] print:static print:bg-transparent print:border print:border-black print:w-[3%] ${displayedCols.length > 2 ? "print:p-[2px]" : "print:p-2"}`}
                    >
                      No
                    </th>
                    <th
                      className={`px-2 py-4 sticky left-[2.5rem] md:left-[3rem] bg-slate-900 z-10 w-[10rem] min-w-[10rem] md:w-[15rem] md:min-w-[15rem] print:static print:bg-transparent print:border print:border-black print:w-[15%] ${displayedCols.length > 2 ? "print:p-[2px]" : "print:p-2"}`}
                    >
                      Nama Santri
                    </th>
                    <th
                      className={`px-2 py-4 text-center sticky left-[12.5rem] md:left-[18rem] bg-slate-900 z-10 w-[4.5rem] min-w-[4.5rem] md:w-[5.5rem] md:min-w-[5.5rem] print:static print:bg-transparent print:border print:border-black print:w-[5%] ${displayedCols.length > 2 ? "print:p-[2px]" : "print:p-2"}`}
                    >
                      Kelas
                    </th>
                    {displayedCols.map((m) => (
                      <th
                        key={m}
                        className={`px-2 md:px-3 py-4 text-center print:border print:border-black print:whitespace-normal print:break-words ${displayedCols.length > 2 ? "print:p-[2px]" : "print:p-2"}`}
                      >
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {sortedData.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-emerald-50/50 transition-colors group print:break-inside-avoid"
                    >
                      <td
                        className={`px-2 ${displayedCols.length > 2 ? "py-2.5 text-[10px] print:text-[6px] print:p-[2px]" : "py-4 text-xs md:text-sm print:text-xs print:p-2"} text-center font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-emerald-50/50 transition-colors z-10 border-r border-slate-100/50 print:static print:border-black print:border print:text-black`}
                      >
                        {idx + 1}
                      </td>
                      {/* TRUNCATE DIHAPUS -> Ganti dengan whitespace-normal break-words agar nama tampil full */}
                      <td
                        className={`px-2 ${displayedCols.length > 2 ? "py-2.5 text-[11px] md:text-xs print:text-[6px] print:p-[2px]" : "py-4 text-sm md:text-base print:text-sm print:p-2"} font-black text-slate-800 uppercase sticky left-[2.5rem] md:left-[3rem] bg-white group-hover:bg-emerald-50/50 transition-colors z-10 border-r border-slate-100/50 whitespace-normal break-words min-w-[10rem] md:min-w-[15rem] print:min-w-0 print:static print:border-black print:border print:text-black print:leading-tight`}
                      >
                        {item[keysMapping.keyNama]}
                      </td>
                      <td
                        className={`px-2 ${displayedCols.length > 2 ? "py-2.5 text-[10px] print:p-[2px]" : "py-4 text-xs md:text-sm print:p-2"} text-center sticky left-[12.5rem] md:left-[18rem] bg-white group-hover:bg-emerald-50/50 transition-colors z-10 border-r border-slate-100/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] print:static print:shadow-none print:border-black print:border print:text-black`}
                      >
                        <span
                          className={`px-2 py-1 bg-slate-100 group-hover:bg-white rounded-md font-black transition-colors print:bg-transparent print:p-0 ${displayedCols.length > 2 ? "text-[9px] md:text-[10px] print:text-[6px]" : "text-xs print:text-xs"}`}
                        >
                          {item[keysMapping.keyKelas]}
                        </span>
                      </td>
                      {displayedCols.map((m) => (
                        <td
                          key={m}
                          className={`px-2 md:px-3 ${displayedCols.length > 2 ? "py-2.5 text-xs print:text-[6px] print:p-[2px]" : "py-4 text-sm md:text-base print:text-xs print:p-2"} text-center font-bold print:border print:border-black print:text-black`}
                        >
                          <RollingValue
                            value={item[m] || "-"}
                            className={
                              displayedCols.length <= 2
                                ? "text-emerald-600 font-black text-lg print:text-black print:text-sm"
                                : "text-slate-600"
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {guruMode === "stats" && (
          <motion.div
            key="stats-view"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            {sortedData.slice(0, 10).map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="flex items-center p-5 bg-white rounded-[1.5rem] shadow-sm border border-slate-50 hover:border-emerald-100 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mr-5 shadow-inner transition-transform group-hover:scale-110 ${idx === 0 ? "bg-amber-400 text-white text-xl" : idx === 1 ? "bg-slate-200 text-slate-600 text-lg" : idx === 2 ? "bg-amber-700/40 text-white text-lg" : "bg-slate-50 text-slate-400"}`}
                >
                  {idx === 0 ? "🏆" : idx + 1}
                </div>
                <div className="flex-1 font-black text-slate-800 uppercase text-sm md:text-base tracking-wide">
                  {item[keysMapping.keyNama]}
                  <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">
                    KELAS {item[keysMapping.keyKelas]}
                  </div>
                </div>
                <div className="text-right font-black text-emerald-600 text-2xl drop-shadow-sm">
                  {item[filters.mapelStats || "RataRata"]}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {guruMode === "race" && (
          <RaceView
            key="race-view"
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
  const [loginInputGuru, setLoginInputGuru] = useState("");
  const [loginInputSantri, setLoginInputSantri] = useState("");
  const [loginError, setLoginError] = useState("");

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

  const navigateTo = (newView) => {
    setView(newView);
    setLoginInputGuru("");
    setLoginInputSantri("");
    setLoginError("");
  };

  const handleLoginGuru = () => {
    if (loginInputGuru === GURU_PASSWORD) navigateTo("guru-dashboard");
    else setLoginError("Password yang Anda masukkan salah.");
  };

  const handleLoginSantri = () => {
    if (!loginInputSantri.trim()) {
      setLoginError("Silakan masukkan nama Anda.");
      return;
    }
    const f = processedData.find((s) =>
      s[keysMapping.keyNama]
        .toLowerCase()
        .includes(loginInputSantri.toLowerCase()),
    );
    if (f) {
      setCurrentUserName(f[keysMapping.keyNama]);
      navigateTo("santri-dashboard");
    } else {
      setLoginError("Data santri tidak ditemukan. Periksa ejaan nama.");
    }
  };

  return (
    // TEMA: Background bernuansa sangat soft emerald agar bersih tapi tematik
    <div className="min-h-screen bg-[#F0F5F2] font-sans text-slate-900 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
        >
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-emerald-800 font-bold uppercase tracking-widest text-xs animate-pulse">
            Memuat Database...
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {view === "selection" && (
          <motion.div
            key="sel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 relative"
          >
            {/* Ornamen Latar Radial */}
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
                Sistem informasi monitoring nilai secara real-time. Silakan
                pilih portal akses Anda.
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
                  Masuk sebagai tenaga pendidik untuk memonitor rekapitulasi
                  nilai seluruh santri.
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
                  Akses personal santri untuk melihat rapor evaluasi hasil
                  belajar secara mandiri.
                </p>
                <div className="mt-8 flex items-center text-amber-500 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                  Cari Data <ChevronRight size={18} className="ml-1" />
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {view === "login-guru" && (
          <motion.div
            key="lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-md p-10 bg-white rounded-[3rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] relative border border-slate-50">
              <button
                onClick={() => navigateTo("selection")}
                className="absolute top-8 left-8 p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 mt-4 shadow-inner">
                <Lock size={32} />
              </div>
              <h2 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
                Login Admin
              </h2>
              <p className="text-center text-slate-500 text-sm mb-8 font-medium">
                Masukkan kunci akses untuk melanjutkan.
              </p>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Ketik Password..."
                  autoFocus
                  value={loginInputGuru}
                  onChange={(e) => {
                    setLoginInputGuru(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLoginGuru()}
                  className={`w-full p-4 rounded-2xl bg-slate-50 border-2 transition-colors outline-none text-center font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white ${loginError ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-emerald-500"}`}
                />
                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs font-bold text-center"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoginGuru}
                  className="w-full p-4 mt-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-xl shadow-slate-900/20"
                >
                  Otorisasi Akses
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {view === "login-santri" && (
          <motion.div
            key="ls"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-md p-10 bg-white rounded-[3rem] shadow-[0_20px_50px_rgb(0,0,0,0.1)] relative border border-slate-50">
              <button
                onClick={() => navigateTo("selection")}
                className="absolute top-8 left-8 p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 mt-4 shadow-inner">
                <Search size={32} />
              </div>
              <h2 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">
                Cari Data Santri
              </h2>
              <p className="text-center text-slate-500 text-sm mb-8 font-medium">
                Masukkan nama lengkap / sebagian untuk verifikasi.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Contoh: Ahmad..."
                  autoFocus
                  value={loginInputSantri}
                  onChange={(e) => {
                    setLoginInputSantri(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLoginSantri()}
                  className={`w-full p-4 rounded-2xl bg-slate-50 border-2 transition-colors outline-none text-center font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white ${loginError ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-amber-500"}`}
                />
                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs font-bold text-center"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoginSantri}
                  className="w-full p-4 mt-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-xl shadow-amber-500/20"
                >
                  Tampilkan Nilai
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PENTING: GuruDashboard tidak dibungkus <motion.div> secara langsung untuk mencegah crash saat unmount */}
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
            handleLogout={() => navigateTo("selection")}
          />
        )}

        {view === "santri-dashboard" && activeStudent && (
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

            {/* Header Santri - Tema Hitam/Emas/Hijau sesuai Logo */}
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
                      transition={{
                        duration: 1.5,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 relative"
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
