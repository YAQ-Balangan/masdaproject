// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { API_URL, GURU_PASSWORD, DAFTAR_MAPEL_PASTI } from "./config/constants";

// Mengimpor halaman yang sudah dipisah
import Selection from "./pages/Selection";
import LoginGuru from "./pages/LoginGuru";
import LoginSantri from "./pages/LoginSantri";
import GuruDashboard from "./pages/GuruDashboard";
import SantriDashboard from "./pages/SantriDashboard";

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
        {view === "selection" && <Selection navigateTo={navigateTo} />}

        {view === "login-guru" && (
          <LoginGuru
            navigateTo={navigateTo}
            loginInputGuru={loginInputGuru}
            setLoginInputGuru={setLoginInputGuru}
            loginError={loginError}
            setLoginError={setLoginError}
            handleLoginGuru={handleLoginGuru}
          />
        )}

        {view === "login-santri" && (
          <LoginSantri
            navigateTo={navigateTo}
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
            handleLogout={() => navigateTo("selection")}
            guruMode={guruMode}
            setGuruMode={setGuruMode}
            filters={filters}
            setFilters={setFilters}
            isSyncing={isSyncing}
            // Menangkap klik nama santri dan memindahkan view
            onStudentClick={(namaSantri) => {
              setCurrentUserName(namaSantri);
              setView("guru-santri-view"); // Pergi ke view rahasia milik guru
            }}
          />
        )}

        {/* VIEW MILIK SANTRI (Klik 'Back' akan kembali ke halaman awal / logout) */}
        {view === "santri-dashboard" && activeStudent && (
          <SantriDashboard
            navigateTo={navigateTo}
            activeStudent={activeStudent}
            keysMapping={keysMapping}
            allMapel={allMapel}
            processedData={processedData}
          />
        )}

        {/* VIEW MILIK GURU KETIKA MELIHAT RAPOR SANTRI */}
        {view === "guru-santri-view" && activeStudent && (
          <SantriDashboard
            navigateTo={() => setView("guru-dashboard")}
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
