import { defineStore } from 'pinia';
import api from '../api/axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from './chat';

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

        // 2. Limpiar el estado del chat (historial y conversación)
        const chatStore = useChatStore();
        chatStore.resetSession();

        // 3. Redirigir
        router.push('/login');
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

    const checkToken = async () => {
        if (!token.value) return false;
        
        try {
            const { data } = await api.get('/auth/check-status');
            user.value = data;
            if(data.token) setToken(data.token); 
            return true;
        } catch (error) {
            logout();
            return false;
        }
    };

    return { user, token, login, register, logout, checkToken };
});