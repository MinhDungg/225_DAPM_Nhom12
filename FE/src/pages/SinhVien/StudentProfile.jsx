import React from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, BookOpen, Award } from 'lucide-react';

const StudentProfile = () => {
    // Dữ liệu mẫu (Giả định sẽ lấy từ API sau này)
    const student = {
        name: 'Huỳnh Minh Dũng',
        id: '22110123',
        email: 'dung.hm.22110123@sv.ute.udn.vn',
        phone: '0905 123 456',
        address: '48 Cao Thắng, Hải Châu, Đà Nẵng',
        major: 'Công nghệ thông tin',
        class: '22CNTT1',
        gpa: '3.8',
        credits: '75',
        awards: ['Học bổng KKHT Học kỳ 1 (2023-2024)', 'Giải Nhì Olympic Tin học']
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header Profile Section */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                {/* Avatar */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-500/20 transform transition-transform group-hover:scale-105 group-hover:rotate-3">
                        {student.name.split(' ').pop().charAt(0)}
                    </div>
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left relative z-10">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">{student.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-full">
                            <GraduationCap size={16} /> {student.id}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-100/50">
                            <BookOpen size={16} /> {student.major}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin liên hệ */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                             <User className="text-blue-500" size={22} /> Thông tin chi tiết
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                                        <p className="text-slate-700 font-medium">{student.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Số điện thoại</p>
                                        <p className="text-slate-700 font-medium">{student.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Địa chỉ</p>
                                        <p className="text-slate-700 font-medium">{student.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lớp</p>
                                        <p className="text-slate-700 font-medium">{student.class}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                             <Award className="text-amber-500" size={22} /> Thành tích & Học bổng
                        </h2>
                        <ul className="space-y-3">
                            {student.awards.map((award, i) => (
                                <li key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                                    <Award size={18} className="text-amber-500" />
                                    <span className="text-slate-700 font-medium">{award}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Thống kê học tập */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-3xl shadow-lg relative overflow-hidden overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-1">GPA Trung bình</p>
                        <h3 className="text-5xl font-black">{student.gpa}</h3>
                        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: '95%' }}></div>
                        </div>
                        <p className="mt-2 text-blue-100 text-xs font-medium">Bạn nằm trong top 5% toàn trường</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-sm">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Tiến độ học tập</p>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-2xl font-black text-slate-800">{student.credits}</span>
                            <span className="text-xs font-bold text-slate-400">/ 145 Tín chỉ</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden leading-none">
                            <div className="h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" style={{ width: '52%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
