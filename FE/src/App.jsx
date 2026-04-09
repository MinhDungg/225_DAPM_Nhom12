// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// CHÚ Ý DÒNG NÀY: Khớp 100% với cây thư mục trong ảnh của bạn
import Layout from './components/layout/Layout.jsx';

// Import từ file index.js trong thư mục pages
import {
  Login,
  StudentDashboard,
  CTSVDashboard,
  DaoTaoDashboard,
  HDXDDashboard,
  KhoaDashboard,
  TaiChinhDashboard,
  HieuTruongDashboard
} from './pages';

function App() {
  const [role, setRole] = useState('SinhVien');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={(r) => setRole(r)} />} />

        <Route path="/" element={<Layout role={role} />}>
          <Route path="sinh-vien" element={<StudentDashboard />} />
          <Route path="ctsv" element={<CTSVDashboard />} />
          <Route path="dao-tao" element={<DaoTaoDashboard />} />
          <Route path="hdxd" element={<HDXDDashboard />} />
          <Route path="khoa" element={<KhoaDashboard />} />
          <Route path="tai-chinh" element={<TaiChinhDashboard />} />
          <Route path="hieu-truong" element={<HieuTruongDashboard />} />

          <Route index element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;