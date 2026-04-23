// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout.jsx';
import { KhieuNaiSinhVien, KhieuNaiQuanLy } from './pages';
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
import TaoDotHocBong from './pages/CTSV/TaoDotHocBong.jsx';
import DaoTaoImport from './pages/DaoTao/DaoTaoImport.jsx';
import DaoTaoDanhSachDot from './pages/DaoTao/DaoTaoDanhSachDot.jsx';
import TaiChinhKinhPhi from './pages/TaiChinh/TaiChinhKinhPhi.jsx';

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
          <Route path="sinh-vien/khieu-nai" element={<KhieuNaiSinhVien />} />
          <Route path="ctsv/khieu-nai" element={<KhieuNaiQuanLy />} />
          <Route path="khoa/khieu-nai" element={<KhieuNaiQuanLy />} />

          {/* ===== ROUTE CHO TASK 04 & 05 ===== */}
          {/* CTSV: Tạo đợt học bổng */}
          <Route path="ctsv/tao-dot-hoc-bong" element={<TaoDotHocBong />} />

          {/* Đào Tạo: Danh sách đợt (chọn đích import) */}
          <Route path="dao-tao/danh-sach" element={<DaoTaoDanhSachDot />} />

          {/* Đào Tạo: Import điểm cho đợt cụ thể (nhận state từ DaoTaoDanhSachDot) */}
          <Route path="dao-tao/import/:maDot" element={<DaoTaoImport />} />

          {/* KHTC: Thiết lập kinh phí học bổng */}
          <Route path="tai-chinh/kinh-phi" element={<TaiChinhKinhPhi />} />

          {/* Nếu gõ đường dẫn root (/) sẽ tự động chuyển hướng về trang login */}
          <Route index element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;