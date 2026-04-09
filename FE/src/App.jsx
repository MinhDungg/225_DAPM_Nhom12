// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout chung
import Layout from './components/Layout';

// Import tất cả trang từ packet "pages"
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
  /**
   * currentUserRole: Biến giả lập vai trò người dùng sau đăng nhập
   * Bạn có thể đổi giá trị này thành: 'SinhVien', 'CTSV', 'DaoTao', 'Khoa', 'HDXD', 'KHTC', 'HieuTruong'
   * để kiểm tra Sidebar hiển thị đúng vai trò đó.
   */
  const currentUserRole = 'SinhVien';

  return (
    <Router>
      <Routes>
        {/* Trang Đăng nhập đứng độc lập (không có Sidebar/Header) */}
        <Route path="/login" element={<Login />} />

        {/* Nhóm các trang Dashboard yêu cầu Layout (Sidebar + Header) */}
        <Route path="/" element={<Layout role={currentUserRole} />}>

          {/* Tương ứng với các Actor trong sơ đồ Usecase */}
          <Route path="sinh-vien" element={<StudentDashboard />} />
          <Route path="ctsv" element={<CTSVDashboard />} />
          <Route path="dao-tao" element={<DaoTaoDashboard />} />
          <Route path="hdxd" element={<HDXDDashboard />} />
          <Route path="khoa" element={<KhoaDashboard />} />
          <Route path="tai-chinh" element={<TaiChinhDashboard />} />
          <Route path="hieu-truong" element={<HieuTruongDashboard />} />

          {/* Khi truy cập trang chủ, tự động chuyển hướng về trang Login */}
          <Route index element={<Navigate to="/login" replace />} />
        </Route>

        {/* Xử lý khi người dùng nhập sai URL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;