import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5163', // Sửa lại thành 5163 (HTTP) để tránh lỗi HTTPS không tin cậy ở localhost
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Thêm interceptor nếu cần (như thêm token vào header request)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Nếu API gọi thành công, cứ trả về data bình thường
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;

            // Xử lý lỗi 401: Token hết hạn hoặc chưa đăng nhập
            if (status === 401) {
                console.error("Token hết hạn hoặc không hợp lệ. Đang chuyển hướng về Login...");
                localStorage.removeItem('token');
                localStorage.removeItem('user'); // Xóa thông tin user nếu có lưu
                
                // Tránh loop chuyển hướng nếu đang ở sẵn trang login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; 
                }
            }
            
            // Xử lý lỗi 403: Không đủ quyền truy cập (Sai Role)
            else if (status === 403) {
                console.error("Lỗi phân quyền: Bạn không có quyền truy cập chức năng này.");
                alert("Bạn không có quyền thực hiện thao tác này!"); // Hoặc dùng thư viện Toast thay thế
            }
        }
        // Ném lỗi ra để các hàm gọi API tự catch (ví dụ: show popup lỗi cụ thể)
        return Promise.reject(error);
    }
);

export default api;
