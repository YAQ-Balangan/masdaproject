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

const RaceItem = memo(
  ({ item, idx, selectedMapel, keysMapping, onStudentClick }) => {
    const rawVal = item[selectedMapel];
    const nilai = typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
    const isFinished = nilai > 0;
    const namaKelas = item[keysMapping.keyKelas].toString().toUpperCase();
    const isMipa = namaKelas.includes("MIPA") || namaKelas.includes("IPA");
    const labelColor = isMipa
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : "text-amber-400 bg-amber-400/10 border-amber-400/20";

    return (
      <motion.div
        variants={fadeUp}
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
            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isMipa ? "bg-emerald-500/40" : "bg-amber-500/40"}`}
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
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white bg-slate-900 px-1 rounded border border-slate-700 z-10">
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
          onStudentClick={onStudentClick}
        />
      ))}
    </motion.div>
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

  const sortedData = useMemo(() => {
    let f = processedData.filter(
      (i) =>
        (filters.kelas ? i[keysMapping.keyKelas] === filters.kelas : true) &&
        i[keysMapping.keyNama]
          .toLowerCase()
          .includes(filters.search.toLowerCase()),
    );

    if (guruMode === "stats" || guruMode === "race") {
      const sortKey = filters.mapelStats || "RataRata";
      return f.sort(
        (a, b) => (parseFloat(b[sortKey]) || 0) - (parseFloat(a[sortKey]) || 0),
      );
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
  }, [processedData, filters, guruMode, keysMapping, tableSort]);

  const displayedCols = filters.mapelTable ? [filters.mapelTable] : allMapel;
  const isFewCols = displayedCols.length <= 2;

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
              untuk menyusun data secara spesifik sebelum melakukan cetak
              dokumen.{" "}
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
              meninjau pencapaian 10 peringkat teratas murid. Silakan urutkan
              berdasarkan <b>Rata-rata Keseluruhan</b> atau spesifik per{" "}
              <b>Mata Pelajaran</b> untuk menganalisis performa terbaik mereka.
            </p>
          )}
          {guruMode === "race" && (
            <p>
              <strong className="text-slate-800 font-black tracking-wide block mb-1">
                Arena Pantauan Live
              </strong>
              Awasi pergerakan pengisian nilai yang sedang berlangsung dengan
              tampilan interaktif! Indikator visual:
              <br className="hidden md:block" />
              <span className="inline-block mr-4 mt-2">
                🧍‍♂️{" "}
                <span className="text-slate-500 font-medium">
                  Belum Ada Nilai (0)
                </span>
              </span>
              <span className="inline-block mr-4 mt-2">
                🏃‍♂️{" "}
                <span className="text-slate-500 font-medium">
                  Nilai Telah Masuk (&gt;0)
                </span>
              </span>
              <span className="inline-block mr-4 mt-2">
                💨{" "}
                <span className="text-slate-500 font-medium">
                  Capaian Sangat Baik (≥90)
                </span>
              </span>
              <span className="inline-block mt-2">
                🏆{" "}
                <span className="text-slate-500 font-medium">
                  Capaian Sempurna (100)
                </span>
              </span>
            </p>
          )}
        </div>
      </motion.div>

      {/* FILTER AREA */}
      <motion.div
        variants={fadeUp}
        className={`grid grid-cols-1 sm:grid-cols-2 ${guruMode === "table" ? "lg:grid-cols-4" : "md:grid-cols-3"} gap-4 print:hidden`}
      >
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari Nama Murid..."
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
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
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-end print:hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase mr-auto hidden sm:block">
                PILIH AKSI:
              </span>
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
                      key={idx}
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
                      {displayedCols.map((m) => (
                        <td
                          key={m}
                          className={`px-2 md:px-3 ${!isFewCols ? "py-2.5 text-xs" : "py-4 text-sm md:text-base"} text-center font-bold print:text-black`}
                        >
                          <RollingValue
                            value={item[m] || "-"}
                            className={
                              isFewCols
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
            exit="hidden"
            className="grid gap-4"
          >
            {sortedData.slice(0, 10).map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                title="Klik untuk lihat rapor murid"
                onClick={() =>
                  onStudentClick && onStudentClick(item[keysMapping.keyNama])
                }
                className="cursor-pointer flex items-center p-5 bg-white rounded-[1.5rem] shadow-sm border border-slate-50 hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)] transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mr-5 shadow-inner transition-transform group-hover:scale-110 ${idx === 0 ? "bg-amber-400 text-white text-xl" : idx === 1 ? "bg-slate-200 text-slate-600 text-lg" : idx === 2 ? "bg-amber-700/40 text-white text-lg" : "bg-slate-50 text-slate-400"}`}
                >
                  {idx === 0 ? "🥇" : idx + 1}
                </div>
                <div className="flex-1 font-black text-slate-800 uppercase text-sm md:text-base tracking-wide group-hover:text-emerald-600 transition-colors">
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
            onStudentClick={onStudentClick}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
