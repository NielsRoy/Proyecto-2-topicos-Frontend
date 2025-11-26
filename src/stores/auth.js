import { defineStore } from 'pinia';
import api from '../api/axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(localStorage.getItem('auth_token') || null);
    const router = useRouter();

    const setToken = (newToken) => {
        token.value = newToken;
        localStorage.setItem('auth_token', newToken);
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('auth_token');
        window.location.href = '/login'; // Forzar recarga limpia
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/sign-in', { email, password });
            setToken(data.token);
            user.value = data;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' };
        }
    };

    const register = async (fullName, email, password) => {
        try {
            const { data } = await api.post('/auth/sign-up', { fullName, email, password });
            setToken(data.token);
            user.value = data;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Error al registrarse' };
        }
    };

    return { user, token, login, register, logout };
});