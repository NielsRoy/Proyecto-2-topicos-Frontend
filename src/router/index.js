import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ChatLayout from '../views/ChatLayout.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/', component: ChatLayout, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    // Necesitamos instanciar el store dentro del guard para evitar errores de inicialización
    const authStore = useAuthStore();
    const publicPages = ['/login', '/register'];
    const authRequired = !publicPages.includes(to.path);
    
    if (authRequired) {
        if (!authStore.token) {
            return next('/login');
        }

        const isValid = await authStore.checkToken();
        
        if (!isValid) {
            return next('/login');
        }
    }

    if (to.path === '/login' && authStore.token) {
        return next('/');
    }

    next();
});

export default router;