import React from 'react';
import { FileText } from 'lucide-react';

const XemMinhChung = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Xem Hồ sơ Minh chứng</h2>
                <p className="text-gray-500 mt-1">Tra cứu chi tiết hồ sơ và minh chứng của từng sinh viên.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <FileText size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-400 font-medium">Chức năng đang được phát triển.</p>
            </div>
        </div>
    );
};

export default XemMinhChung;
