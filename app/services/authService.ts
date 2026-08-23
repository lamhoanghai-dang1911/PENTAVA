const API_BASE_URL = 'http://192.168.1.9:8081/api/auth';
export const authService = {
    // 1. Đăng ký
    async register(data: { email: string; password: string; name: string }) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Đăng ký thất bại');
        return result;
    },

    // 2. Xác thực OTP
    async verifyOtp(data: { email: string; otpCode: string }) {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Xác thực OTP thất bại');
        return result;
    },

    // 3. Đăng nhập
    async login(data: { email: string; password: string }) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Đăng nhập thất bại');
        return result; // Trả về accessToken
    },

    // 4. Đăng nhập Google
    async googleLogin(idToken: string) {
        const response = await fetch(`${API_BASE_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Đăng nhập Google thất bại');
        return result;
    },
};