// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout.jsx';
import { KhieuNaiSinhVien, KhieuNaiQuanLy } from './pages';
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

        {/* CÁC ROUTE ĐƯỢC BỌC TRONG LAYOUT */}
        <Route path="/" element={<Layout role={role} />}>

          {/* Trang Dashboard chính của từng Role */}
          <Route path="sinh-vien" element={<StudentDashboard />} />
          <Route path="ctsv" element={<CTSVDashboard />} />
          <Route path="dao-tao" element={<DaoTaoDashboard />} />
          <Route path="hdxd" element={<HDXDDashboard />} />
          <Route path="khoa" element={<KhoaDashboard />} />
          <Route path="tai-chinh" element={<TaiChinhDashboard />} />
          <Route path="hieu-truong" element={<HieuTruongDashboard />} />

          {/* ===== ROUTE CHO CHỨC NĂNG KHIẾU NẠI ===== */}
          {/* Dành cho Sinh Viên */}
          <Route path="sinh-vien/khieu-nai" element={<KhieuNaiSinhVien />} />

          {/* Dành cho CTSV (Khớp với menuConfig trong Layout) */}
          <Route path="ctsv/khieu-nai" element={<KhieuNaiQuanLy />} />

          {/* Dành cho Khoa (Nếu ban nãy bạn có thêm menu KhieuNai cho Khoa ở Layout) */}
          <Route path="khoa/khieu-nai" element={<KhieuNaiQuanLy />} />

          {/* Nếu gõ đường dẫn root (/) sẽ tự động chuyển hướng về trang login */}
          <Route index element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;