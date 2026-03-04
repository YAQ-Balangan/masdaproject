import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { API_URL, GURU_PASSWORD, DAFTAR_MAPEL_PASTI } from "./config/constants";

import Selection from "./pages/Selection";
import LoginGuru from "./pages/LoginGuru";
import LoginSantri from "./pages/LoginSantri";
import GuruDashboard from "./pages/GuruDashboard";
import SantriDashboard from "./pages/SantriDashboard";

export default function App() {
  // 1. MEMBACA MEMORI LOKAL SAAT WEB PERTAMA KALI DIBUKA
  const initialView = localStorage.getItem("app_view") || "selection";
  const initialUserName = localStorage.getItem("app_userName") || null;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Menggunakan memori lokal sebagai posisi awal (bukan selalu dari "selection")
  const [view, setView] = useState(initialView);
  const [currentUserName, setCurrentUserName] = useState(initialUserName);
  const [guruMode, setGuruMode] = useState("table");

  const [filters, setFilters] = useState({
    search: "",
    kelas: "",
    mapelTable: "",
    mapelStats: "",
  });

  const [loginInputGuru, setLoginInputGuru] = useState("");
  // loginInputSantri sekarang akan menyimpan Nomor Peserta
  const [loginInputSantri, setLoginInputSantri] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- SISTEM 1: AUTO-SAVE KE MEMORI LOKAL ---
  // Setiap kali halaman (view) atau nama murid berubah, otomatis simpan ke brankas browser
  useEffect(() => {
    localStorage.setItem("app_view", view);
    if (currentUserName) {
      localStorage.setItem("app_userName", currentUserName);
    } else {
      localStorage.removeItem("app_userName");
    }
  }, [view, currentUserName]);
  // -------------------------------------------

  // --- SISTEM 2: PENANGKAL SWIPE BACK KELUAR APLIKASI ---
  useEffect(() => {
    // Daftarkan posisi saat ini ke riwayat HP saat web baru dimuat
    window.history.replaceState(
      { view: initialView, userName: initialUserName },
      "",
    );

    // Dengarkan saat user melakukan "Swipe Back" atau "Tombol Kembali" di HP
    const handlePopState = (event) => {
      if (event.state) {
        setView(event.state.view);
        setCurrentUserName(event.state.userName || null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  // ------------------------------------------------------

  const fetchData = async (isInitial = false) => {
    if (isSyncing) return;
    if (isInitial && data.length === 0) setLoading(true);
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
    if (!data.length)
      return {
        keyNama: "Nama",
        keyKelas: "Kelas",
        keyNoPeserta: "Nomor Peserta",
      };
    const keys = Object.keys(data[0]);

    return {
      keyNama: keys.find((k) => k.toLowerCase().includes("nama")) || "Nama",
      keyKelas: keys.find((k) => k.toLowerCase().includes("kelas")) || "Kelas",
      // Menambahkan pencarian untuk kolom Nomor Peserta
      keyNoPeserta:
        keys.find(
          (k) =>
            k.toLowerCase().includes("nomor") ||
            k.toLowerCase().includes("no peserta") ||
            k.toLowerCase() === "nis",
        ) || "Nomor Peserta",
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
    const { keyNama, keyKelas, keyNoPeserta, keyMapelRaw, keyNilaiRaw } =
      keysMapping;
    const grouped = {};

    data.forEach((row) => {
      const nama = row[keyNama]?.toString().trim();
      if (!nama) return;

      if (!grouped[nama])
        grouped[nama] = {
          [keyNama]: nama,
          [keyKelas]: row[keyKelas] || "",
          // Menyimpan data Nomor Peserta dari sheet ke dalam processedData
          [keyNoPeserta]: row[keyNoPeserta]?.toString().trim() || "",
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
            ![keyNama, keyKelas, keyNoPeserta, "Total", "Count"].includes(k) &&
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
            keysMapping.keyNoPeserta,
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

  // --- FUNGSI NAVIGASI YANG DIPERBARUI ---
  // Fungsi ini sekarang sekaligus menancapkan jejak ke dalam sistem browser
  const navigateTo = (newView, newUserName = currentUserName) => {
    setView(newView);

    // Pastikan username diperbarui jika dikirim
    if (newUserName !== currentUserName) {
      setCurrentUserName(newUserName);
    }

    setLoginInputGuru("");
    setLoginInputSantri("");
    setLoginError("");

    // Tambahkan jejak baru ke browser history agar fitur swipe back aktif
    window.history.pushState({ view: newView, userName: newUserName }, "");
  };
  // ---------------------------------------

  const handleLoginGuru = () => {
    if (loginInputGuru === GURU_PASSWORD) navigateTo("guru-dashboard", null);
    else setLoginError("Password yang Anda masukkan salah.");
  };

  const handleLoginSantri = () => {
    if (!loginInputSantri.trim()) {
      setLoginError("Silakan masukkan Nomor Peserta Anda.");
      return;
    }

    const searchNoPeserta = loginInputSantri.trim();

    // Pencarian berdasarkan Nomor Peserta
    const f = processedData.find((s) => {
      const noPesertaData = s[keysMapping.keyNoPeserta];
      return (
        noPesertaData && noPesertaData.toString().trim() === searchNoPeserta
      );
    });

    if (f) {
      // Buka dashboard santri sekaligus masukkan nama santrinya ke sistem
      navigateTo("santri-dashboard", f[keysMapping.keyNama]);
    } else {
      setLoginError("Nomor Peserta tidak ditemukan, pastikan sama persis.");
    }
  };

  return (
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
          <Selection navigateTo={(v) => navigateTo(v, null)} />
        )}

        {view === "login-guru" && (
          <LoginGuru
            navigateTo={() => navigateTo("selection", null)}
            loginInputGuru={loginInputGuru}
            setLoginInputGuru={setLoginInputGuru}
            loginError={loginError}
            setLoginError={setLoginError}
            handleLoginGuru={handleLoginGuru}
          />
        )}

        {view === "login-santri" && (
          <LoginSantri
            navigateTo={() => navigateTo("selection", null)}
            loginInputSantri={loginInputSantri}
            setLoginInputSantri={setLoginInputSantri}
            loginError={loginError}
            setLoginError={setLoginError}
            handleLoginSantri={handleLoginSantri}
          />
        )}

        {view === "guru-dashboard" && (
          <GuruDashboard
            processedData={processedData}
            keysMapping={keysMapping}
            allMapel={allMapel}
            handleLogout={() => navigateTo("selection", null)}
            guruMode={guruMode}
            setGuruMode={setGuruMode}
            filters={filters}
            setFilters={setFilters}
            isSyncing={isSyncing}
            onStudentClick={(namaSantri) => {
              // Saat guru klik nama murid, otomatis pindah ke tampilan rapor murid
              navigateTo("guru-santri-view", namaSantri);
            }}
          />
        )}

        {/* TAMPILAN JIKA SANTRI YANG LOGIN */}
        {view === "santri-dashboard" && activeStudent && (
          <SantriDashboard
            navigateTo={() => navigateTo("selection", null)} // Tombol back keluar
            activeStudent={activeStudent}
            keysMapping={keysMapping}
            allMapel={allMapel}
            processedData={processedData}
          />
        )}

        {/* TAMPILAN JIKA GURU YANG MEMBUKA RAPOR SANTRI */}
        {view === "guru-santri-view" && activeStudent && (
          <SantriDashboard
            navigateTo={() => navigateTo("guru-dashboard", null)} // Tombol back kembali ke tabel guru
            activeStudent={activeStudent}
            keysMapping={keysMapping}
            allMapel={allMapel}
            processedData={processedData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
