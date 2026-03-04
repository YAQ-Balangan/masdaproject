// src/pages/GuruDashboard.jsx
import React, { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  LogOut,
  Search,
  Printer,
  Download,
  Flag,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { fadeUp, staggerContainer } from "../config/constants";

// IMPORT LIBRARY BARU UNTUK XLSX & DOCX MURNI
import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";

// KONFIGURASI KKM
const KKM_SCORE = 75;

const RollingValue = memo(({ value, className, isKkmFailed }) => (
  <div
    className={`relative flex flex-col items-center justify-center overflow-hidden h-[1.2em] ${className} ${
      isKkmFailed ? "text-red-600 font-black" : ""
    }`}
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

// --- KOMPONEN RACE ITEM ---
const RaceItem = memo(
  ({ item, idx, selectedMapel, keysMapping, onStudentClick }) => {
    const rawVal = item[selectedMapel];
    const nilai = typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
    const isFinished = nilai > 0;
    const isKkmFailed = isFinished && nilai < KKM_SCORE;
    const namaKelas = item[keysMapping.keyKelas].toString().toUpperCase();
    const isMipa = namaKelas.includes("MIPA") || namaKelas.includes("IPA");
    const labelColor = isMipa
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : "text-amber-400 bg-amber-400/10 border-amber-400/20";

    return (
      <motion.div
        layout // MENGAKTIFKAN ANIMASI POSISI DINAMIS
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 group relative py-1"
      >
        <div
          title="Klik untuk lihat rapor murid"
          onClick={() =>
            onStudentClick && onStudentClick(item[keysMapping.keyNama])
          }
          className={`w-32 md:w-48 shrink-0 px-3 py-2 rounded-xl border text-[10px] font-black uppercase truncate cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all shadow-sm ${labelColor}`}
        >
          {idx + 1}. {item[keysMapping.keyNama]}
        </div>
        <div className="flex-1 h-7 bg-slate-800/50 rounded-full relative overflow-hidden border border-slate-700/50">
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${
              isKkmFailed
                ? "bg-red-500/50"
                : isMipa
                  ? "bg-emerald-500/40"
                  : "bg-amber-500/40"
            }`}
            style={{ width: `${nilai}%` }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-xl drop-shadow-md"
            animate={{ left: `${nilai * 0.9}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
          >
            <div className="relative hover:scale-125 transition-transform cursor-pointer flex items-center justify-center">
              {nilai === 100 ? (
                <img
                  src="/piala.gif"
                  alt="Finish"
                  className="h-8 w-auto object-contain drop-shadow-md"
                />
              ) : nilai >= 90 ? (
                <img
                  src="/terbang.gif"
                  alt="Lari Kencang"
                  className="h-8 w-auto object-contain drop-shadow-md scale-x-[1]"
                />
              ) : isFinished ? (
                <img
                  src="/lari.gif"
                  alt="Lari"
                  className="h-8 w-auto object-contain drop-shadow-md"
                />
              ) : (
                <img
                  src="/berdiri.gif"
                  alt="Start"
                  className="h-8 w-auto object-contain drop-shadow-md"
                />
              )}

              {isFinished && (
                <span
                  className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white px-1 rounded border z-10 ${isKkmFailed ? "bg-red-600 border-red-800" : "bg-slate-900 border-slate-700"}`}
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

// --- KOMPONEN RACE VIEW ---
const RaceView = ({
  sortedData,
  selectedMapel,
  keysMapping,
  onStudentClick,
}) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    exit="hidden"
    className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl"
  >
    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
      <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
        <Flag className="text-amber-400" /> Live Race Arena
      </h3>
    </div>
    <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-2">
      <AnimatePresence mode="popLayout">
        {sortedData.map((item, idx) => (
          <RaceItem
            key={item[keysMapping.keyNama]}
            item={item}
            idx={idx}
            selectedMapel={selectedMapel}
            keysMapping={keysMapping}
            onStudentClick={onStudentClick}
          />
        ))}
      </AnimatePresence>
    </div>
  </motion.div>
);

export default function GuruDashboard({
  processedData,
  keysMapping,
  allMapel,
  handleLogout,
  guruMode,
  setGuruMode,
  filters,
  setFilters,
  isSyncing,
  onStudentClick,
}) {
  const [tableSort, setTableSort] = useState("Kelas");
  const [showRemedial, setShowRemedial] = useState(false);
  const [statsOrder, setStatsOrder] = useState("top");

  // --- PRE-PROCESSING: MENGGABUNGKAN MAPEL BAHASA INDONESIA ---
  const { mergedData, mergedAllMapel } = useMemo(() => {
    // 1. Buang "Bahasa Indonesia (IPA)" dari daftar header tabel / dropdown
    const newMapel = allMapel.filter(
      (m) => m !== "Bahasa Indonesia (IPA)" && m !== "Bahasa Indonesia (MIPA)",
    );

    // 2. Gabungkan datanya ke satu kolom untuk setiap murid
    const newData = processedData.map((item) => {
      const newItem = { ...item };

      // Ambil nilai IPA (cek kedua kemungkinan penamaan)
      const valIpa =
        newItem["Bahasa Indonesia (IPA)"] || newItem["Bahasa Indonesia (MIPA)"];

      // Jika murid IPA punya nilai, timpa/masukkan ke properti "Bahasa Indonesia" umum
      if (
        valIpa !== undefined &&
        valIpa !== null &&
        valIpa !== "" &&
        valIpa !== "-"
      ) {
        newItem["Bahasa Indonesia"] = valIpa;
      }

      // Hapus properti IPA agar data bersih saat diekspor atau dilooping
      delete newItem["Bahasa Indonesia (IPA)"];
      delete newItem["Bahasa Indonesia (MIPA)"];

      return newItem;
    });

    return { mergedData: newData, mergedAllMapel: newMapel };
  }, [processedData, allMapel]);
  // ------------------------------------------------------------

  // Gunakan data dan daftar mapel yang sudah digabungkan (merged)
  const displayedCols = filters.mapelTable
    ? [filters.mapelTable]
    : mergedAllMapel;
  const isFewCols = displayedCols.length <= 2;

  // LOGIKA SORTING & FILTERING UTAMA
  const sortedData = useMemo(() => {
    let f = mergedData.filter((i) => {
      // 1. FILTER BLOKIR NAMA TERTENTU
      const namaMurid = String(i[keysMapping.keyNama] || "")
        .trim()
        .toLowerCase();
      if (namaMurid.includes("muhammad jailani")) {
        return false; // Skip / Blokir dari dashboard
      }

      // 2. FILTER KELAS / JURUSAN
      const classStr = String(i[keysMapping.keyKelas]).toUpperCase();
      let matchKelas = true;

      if (filters.kelas) {
        if (filters.kelas === "MIPA") {
          matchKelas = classStr.includes("MIPA") || classStr.includes("IPA");
        } else if (filters.kelas === "IPS") {
          matchKelas = classStr.includes("IPS");
        } else {
          matchKelas = i[keysMapping.keyKelas] === filters.kelas;
        }
      }

      // 3. FILTER PENCARIAN
      const matchSearch = namaMurid.includes(filters.search.toLowerCase());

      // 4. FILTER REMEDIAL
      let matchRemedial = true;
      if (showRemedial) {
        matchRemedial = displayedCols.some((m) => {
          const val = parseFloat(i[m]);
          return !isNaN(val) && val < KKM_SCORE && val > 0;
        });
      }

      return matchKelas && matchSearch && matchRemedial;
    });

    // URUTKAN BERDASARKAN MODE
    if (guruMode === "stats" || guruMode === "race") {
      const sortKey = filters.mapelStats || "RataRata";
      return f.sort((a, b) => {
        const valA = parseFloat(a[sortKey]) || 0;
        const valB = parseFloat(b[sortKey]) || 0;
        return guruMode === "stats" && statsOrder === "bottom"
          ? valA - valB
          : valB - valA;
      });
    } else {
      if (tableSort === "A-Z") {
        return f.sort((a, b) =>
          String(a[keysMapping.keyNama]).localeCompare(
            String(b[keysMapping.keyNama]),
          ),
        );
      } else if (tableSort === "Z-A") {
        return f.sort((a, b) =>
          String(b[keysMapping.keyNama]).localeCompare(
            String(a[keysMapping.keyNama]),
          ),
        );
      } else if (tableSort === "Kelas") {
        return f.sort((a, b) => {
          const classCompare = String(a[keysMapping.keyKelas]).localeCompare(
            String(b[keysMapping.keyKelas]),
          );
          if (classCompare !== 0) return classCompare;
          return String(a[keysMapping.keyNama]).localeCompare(
            String(b[keysMapping.keyNama]),
          );
        });
      }
      return f;
    }
  }, [
    mergedData,
    filters,
    guruMode,
    keysMapping,
    tableSort,
    showRemedial,
    displayedCols,
    statsOrder,
  ]);

  const insightStats = useMemo(() => {
    let totalSiswa = sortedData.length;
    let totalRemedial = 0;
    let sumRataRata = 0;

    sortedData.forEach((item) => {
      sumRataRata += parseFloat(item["RataRata"]) || 0;
      const isRemedy = displayedCols.some(
        (m) => parseFloat(item[m]) < KKM_SCORE && parseFloat(item[m]) > 0,
      );
      if (isRemedy) totalRemedial++;
    });

    return {
      total: totalSiswa,
      rataRataKelas: totalSiswa > 0 ? (sumRataRata / totalSiswa).toFixed(1) : 0,
      remedial: totalRemedial,
    };
  }, [sortedData, displayedCols]);

  const handleExport = async (type) => {
    if (type === "print" || type === "pdf") {
      window.print();
      return;
    }

    if (type === "xls") {
      const headers = ["No", "Nama Murid", "Kelas", ...displayedCols];
      const dataRows = sortedData.map((item, idx) => [
        idx + 1,
        item[keysMapping.keyNama],
        item[keysMapping.keyKelas],
        ...displayedCols.map((m) => item[m] || "-"),
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      const wscols = [
        { wch: 5 },
        { wch: 35 },
        { wch: 15 },
        ...displayedCols.map(() => ({ wch: 15 })),
      ];
      worksheet["!cols"] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Nilai");
      XLSX.writeFile(workbook, "Rekap_Nilai_Santri.xlsx");
      return;
    }

    if (type === "doc") {
      try {
        const headerCells = ["No", "Nama Murid", "Kelas", ...displayedCols].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: text, bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
        );

        const dataRows = sortedData.map((item, idx) => {
          const rowData = [
            (idx + 1).toString(),
            item[keysMapping.keyNama] || "",
            item[keysMapping.keyKelas] || "",
            ...displayedCols.map((m) => (item[m] || "-").toString()),
          ];
          return new TableRow({
            children: rowData.map(
              (text, cIdx) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      text: text,
                      alignment:
                        cIdx === 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
                    }),
                  ],
                  margins: { top: 100, bottom: 100, left: 100, right: 100 },
                }),
            ),
          });
        });

        const docTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: headerCells, tableHeader: true }),
            ...dataRows,
          ],
        });

        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  size: {
                    orientation:
                      displayedCols.length > 4 ? "landscape" : "portrait",
                  },
                },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "REKAPITULASI NILAI AKADEMIK",
                      bold: true,
                      size: 28,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 400 },
                }),
                docTable,
              ],
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "Rekap_Nilai_Santri.docx");
      } catch (error) {
        console.error("Gagal membuat DOCX:", error);
        alert("Terjadi kesalahan saat membuat file DOCX.");
      }
      return;
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-full"
    >
      <style type="text/css">{`
        /* CSS Live Wallpaper Background */
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .header-live-bg {
          background: linear-gradient(-45deg, #d1fae5, #ccfbf1, #ecfdf5, #f0fdfa);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }

        /* CSS Print */
        @media print {
          @page { margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ::-webkit-scrollbar { display: none !important; }
          #data-table-guru { width: ${isFewCols ? "max-content" : "100%"} !important; max-width: 100% !important; margin: 0 auto !important; table-layout: ${isFewCols ? "auto" : "fixed"} !important; }
          #data-table-guru th, #data-table-guru td { border: 1px solid black !important; padding: ${isFewCols ? "8px" : "4px"} !important; white-space: ${isFewCols ? "nowrap" : "normal"} !important; word-wrap: break-word !important; overflow-wrap: break-word !important; font-size: ${isFewCols ? "11pt" : "8.5pt"} !important; color: black !important; }
          ${!isFewCols ? `#data-table-guru th:nth-child(1), #data-table-guru td:nth-child(1) { width: 4% !important; text-align: center; } #data-table-guru th:nth-child(2), #data-table-guru td:nth-child(2) { width: 22% !important; } #data-table-guru th:nth-child(3), #data-table-guru td:nth-child(3) { width: 8% !important; text-align: center; }` : ""}
        }
      `}</style>

      {/* HEADER ELEGAN DENGAN LIVE WALLPAPER */}
      <motion.header
        variants={fadeUp}
        className="relative flex flex-col lg:flex-row justify-between items-center p-6 rounded-[2rem] shadow-sm border border-emerald-100/50 gap-4 print:hidden overflow-hidden header-live-bg z-0"
      >
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-10 w-72 h-72 bg-white/40 rounded-[40%] backdrop-blur-md -z-10"
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 60, -20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 right-10 w-80 h-80 bg-teal-100/40 rounded-[35%] backdrop-blur-md -z-10"
        />

        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-white/80 backdrop-blur-sm text-emerald-600 rounded-2xl shadow-sm border border-white/60">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 drop-shadow-sm">
              Monitoring Nilai (Real-Time)
            </h2>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${isSyncing ? "text-amber-600 animate-pulse" : "text-emerald-700"}`}
            >
              {isSyncing ? "Syncing Data..." : "Live Active"}
            </p>
          </div>
        </div>
        <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl gap-1 border border-white/80 shadow-sm z-10">
          {["table", "stats", "race"].map((m) => (
            <button
              key={m}
              onClick={() => setGuruMode(m)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${guruMode === m ? "bg-white text-emerald-700 shadow-md scale-105" : "text-slate-600 hover:text-emerald-800 hover:bg-white/40"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-600 hover:text-red-500 hover:bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all z-10"
        >
          <LogOut size={16} /> Keluar
        </button>
      </motion.header>

      {/* BANNER INSTRUKSI ELEGAN */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden bg-white border border-slate-100 rounded-[1.5rem] p-5 text-sm text-slate-700 flex items-start gap-4 print:hidden shadow-sm"
      >
        <div className="p-2.5 bg-emerald-50 rounded-full text-emerald-500 shrink-0">
          <Sparkles size={20} />
        </div>
        <div className="leading-relaxed pt-0.5">
          {guruMode === "table" && (
            <p>
              <strong className="text-slate-800 font-black tracking-wide block mb-1">
                Eksplorasi Lembar Nilai
              </strong>
              Mari jelajahi rekapitulasi data secara menyeluruh. Anda dapat
              menggunakan filter <b>Kelas</b> dan <b>Mata Pelajaran</b> di bawah
              untuk menyusun data secara spesifik{" "}
              <b>sebelum melakukan cetak/download</b> dokumen.{" "}
              <span className="text-emerald-600 font-bold">
                Klik pada nama murid di tabel untuk membuka laporan nilainya
                secara rinci.
              </span>
            </p>
          )}
          {guruMode === "stats" && (
            <p>
              <strong className="text-slate-800 font-black tracking-wide block mb-1">
                Papan Peringkat Akademik
              </strong>
              Selamat datang di pusat statistik kelas! Di sini Anda dapat
              meninjau pencapaian
              <span className="text-emerald-600 font-bold ml-1">
                10 peringkat teratas atau yang membutuhkan bimbingan.
              </span>
            </p>
          )}
          {guruMode === "race" && (
            <p>
              <strong className="text-slate-800 font-black tracking-wide block mb-1">
                Arena Pantauan Live
              </strong>
              Awasi pergerakan pengisian nilai yang sedang berlangsung dengan
              tampilan interaktif!
            </p>
          )}
        </div>
      </motion.div>

      {/* FILTER AREA */}
      <motion.div
        variants={fadeUp}
        className={`grid grid-cols-1 sm:grid-cols-2 ${guruMode === "table" ? "lg:grid-cols-4" : "md:grid-cols-3"} gap-4 print:hidden`}
      >
        <div className="relative group flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari Nama Murid..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          {guruMode === "table" && (
            <button
              onClick={() => setShowRemedial(!showRemedial)}
              title="Tampilkan Siswa Remedial Saja"
              className={`p-4 rounded-2xl border transition-all shadow-sm flex items-center justify-center shrink-0 ${showRemedial ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"}`}
            >
              <AlertTriangle
                size={20}
                className={showRemedial ? "animate-pulse" : ""}
              />
            </button>
          )}
        </div>

        {guruMode === "table" && (
          <select
            className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-emerald-700"
            value={tableSort}
            onChange={(e) => setTableSort(e.target.value)}
          >
            <option value="Kelas">Urutkan: Per Kelas</option>
            <option value="A-Z">Urutkan: Nama (A-Z)</option>
            <option value="Z-A">Urutkan: Nama (Z-A)</option>
          </select>
        )}

        <select
          className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          value={filters.kelas}
          onChange={(e) => setFilters({ ...filters, kelas: e.target.value })}
        >
          <option value="">Semua Kelas</option>
          <option value="MIPA">Kelas MIPA</option>
          <option value="IPS">Kelas IPS</option>
          <option disabled>- - - - - -</option>
          {[...new Set(mergedData.map((i) => i[keysMapping.keyKelas]))]
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
          {mergedAllMapel.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {guruMode === "stats" && (
          <div className="flex bg-white p-1.5 rounded-2xl gap-1 border border-slate-100 shadow-sm sm:col-span-2 md:col-span-3">
            <button
              onClick={() => setStatsOrder("top")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs py-2 font-black uppercase transition-all ${statsOrder === "top" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <TrendingUp size={16} /> Top 10 Terbaik
            </button>
            <button
              onClick={() => setStatsOrder("bottom")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs py-2 font-black uppercase transition-all ${statsOrder === "bottom" ? "bg-red-50 text-red-600 shadow-sm border border-red-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
            >
              <TrendingDown size={16} /> Bottom 10 (Butuh Bimbingan)
            </button>
          </div>
        )}
      </motion.div>

      {/* KONTEN UTAMA DENGAN FADE-UP SEMUA MODE */}
      <AnimatePresence mode="wait">
        {guruMode === "table" && (
          <motion.div
            key="table-view"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col print:shadow-none print:rounded-none print:border-none"
          >
            <div className="px-6 py-4 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap gap-6 items-center print:hidden">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Total Ditampilkan
                </span>
                <span className="text-lg font-black text-slate-800">
                  {insightStats.total} Siswa
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Rata-rata Filter
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {insightStats.rataRataKelas}
                </span>
              </div>
              <div className="flex flex-col border-l border-emerald-200/50 pl-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Perlu Remedial (&lt; KKM {KKM_SCORE})
                </span>
                <span
                  className={`text-lg font-black ${insightStats.remedial > 0 ? "text-red-500" : "text-slate-400"}`}
                >
                  {insightStats.remedial} Siswa
                </span>
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => handleExport("print")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
                >
                  <Download size={14} /> PDF
                </button>
                <button
                  onClick={() => handleExport("xls")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
                >
                  <Download size={14} /> XLSX
                </button>
                <button
                  onClick={() => handleExport("doc")}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-bold uppercase rounded-xl transition-colors shadow-sm"
                >
                  <Download size={14} /> DOCX
                </button>
              </div>
            </div>

            <div className="overflow-x-auto print:overflow-visible print:w-full">
              <table
                id="data-table-guru"
                className="w-full text-left border-collapse min-w-max print:min-w-0"
              >
                <thead
                  className={`bg-slate-900 text-white uppercase font-black whitespace-nowrap transition-all print:bg-slate-200 print:text-black print:leading-tight ${!isFewCols ? "text-[9px] md:text-[10px]" : "text-xs md:text-sm"}`}
                >
                  <tr>
                    <th className="px-2 py-4 text-center sticky left-0 bg-slate-900 z-10 w-[2.5rem] min-w-[2.5rem] md:w-[3rem] md:min-w-[3rem] print:static print:bg-transparent">
                      No
                    </th>
                    <th className="px-2 py-4 sticky left-[2.5rem] md:left-[3rem] bg-slate-900 z-10 w-[10rem] min-w-[10rem] md:w-[15rem] md:min-w-[15rem] print:static print:bg-transparent">
                      Nama Murid
                    </th>
                    <th className="px-2 py-4 text-center sticky left-[12.5rem] md:left-[18rem] bg-slate-900 z-10 w-[4.5rem] min-w-[4.5rem] md:w-[5.5rem] md:min-w-[5.5rem] print:static print:bg-transparent">
                      Kelas
                    </th>
                    {displayedCols.map((m) => (
                      <th
                        key={m}
                        className="px-2 md:px-3 py-4 text-center print:whitespace-normal print:break-words"
                      >
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {sortedData.map((item, idx) => (
                    <tr
                      key={item[keysMapping.keyNama]}
                      className="hover:bg-emerald-50/50 transition-colors group print:break-inside-avoid"
                    >
                      <td
                        className={`px-2 ${!isFewCols ? "py-2.5 text-[10px]" : "py-4 text-xs md:text-sm"} text-center font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-emerald-50/50 transition-colors z-10 border-r border-slate-100/50 print:static print:text-black`}
                      >
                        {idx + 1}
                      </td>

                      <td
                        title="Klik untuk lihat rapor murid"
                        onClick={() =>
                          onStudentClick &&
                          onStudentClick(item[keysMapping.keyNama])
                        }
                        className={`px-2 ${!isFewCols ? "py-2.5 text-[11px] md:text-xs" : "py-4 text-sm md:text-base"} font-black text-slate-800 uppercase sticky left-[2.5rem] md:left-[3rem] bg-white group-hover:bg-emerald-50/50 transition-colors z-10 border-r border-slate-100/50 whitespace-normal break-words min-w-[10rem] md:min-w-[15rem] print:min-w-0 print:static print:text-black print:leading-tight cursor-pointer hover:text-emerald-600 hover:underline underline-offset-4`}
                      >
                        {item[keysMapping.keyNama]}
                      </td>

                      <td
                        className={`px-2 ${!isFewCols ? "py-2.5 text-[10px]" : "py-4 text-xs md:text-sm"} text-center sticky left-[12.5rem] md:left-[18rem] bg-white group-hover:bg-emerald-50/50 transition-colors z-10 border-r border-slate-100/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] print:static print:shadow-none print:text-black`}
                      >
                        <span
                          className={`px-2 py-1 bg-slate-100 group-hover:bg-white rounded-md font-black transition-colors print:bg-transparent print:p-0 ${!isFewCols ? "text-[9px] md:text-[10px]" : "text-xs"}`}
                        >
                          {item[keysMapping.keyKelas]}
                        </span>
                      </td>
                      {displayedCols.map((m) => {
                        const val = parseFloat(item[m]);
                        const isKkmFailed =
                          !isNaN(val) && val < KKM_SCORE && val > 0;
                        return (
                          <td
                            key={m}
                            className={`px-2 md:px-3 ${!isFewCols ? "py-2.5 text-xs" : "py-4 text-sm md:text-base"} text-center font-bold print:text-black ${isKkmFailed ? "bg-red-50/30 print:bg-transparent print:text-red-700" : ""}`}
                          >
                            <RollingValue
                              value={item[m] || "-"}
                              isKkmFailed={isKkmFailed}
                              className={
                                isFewCols
                                  ? "text-emerald-600 font-black text-lg print:text-black print:text-sm"
                                  : "text-slate-600"
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* --- PERBAIKAN DI STATS VIEW --- */}
        {guruMode === "stats" && (
          <motion.div
            key="stats-view"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid gap-4"
          >
            <AnimatePresence mode="popLayout">
              {sortedData.slice(0, 10).map((item, idx) => (
                <motion.div
                  key={item[keysMapping.keyNama]}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  title="Klik untuk lihat rapor murid"
                  onClick={() =>
                    onStudentClick && onStudentClick(item[keysMapping.keyNama])
                  }
                  className="cursor-pointer flex items-center p-5 bg-white rounded-[1.5rem] shadow-sm border border-slate-50 hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] transition-all group"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mr-5 shadow-inner transition-transform group-hover:scale-110 ${statsOrder === "bottom" ? "bg-red-100 text-red-600 text-lg" : idx === 0 ? "bg-amber-400 text-white text-xl" : idx === 1 ? "bg-slate-200 text-slate-600 text-lg" : idx === 2 ? "bg-amber-700/40 text-white text-lg" : "bg-slate-50 text-slate-400"}`}
                  >
                    {statsOrder === "bottom"
                      ? "🚨"
                      : idx === 0
                        ? "🥇"
                        : idx + 1}
                  </div>
                  <div className="flex-1 font-black text-slate-800 uppercase text-sm md:text-base tracking-wide group-hover:text-emerald-600 transition-colors">
                    {item[keysMapping.keyNama]}
                    <div className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">
                      KELAS {item[keysMapping.keyKelas]}
                    </div>
                  </div>
                  <div
                    className={`text-right font-black text-2xl drop-shadow-sm ${parseFloat(item[filters.mapelStats || "RataRata"]) < KKM_SCORE ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {item[filters.mapelStats || "RataRata"]}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {guruMode === "race" && (
          <RaceView
            key="race-view"
            sortedData={sortedData}
            selectedMapel={filters.mapelStats || "RataRata"}
            keysMapping={keysMapping}
            onStudentClick={onStudentClick}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
