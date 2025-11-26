<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input v-model="email" type="email" required class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input v-model="password" type="password" required class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button :disabled="loading" type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Cargando...' : 'Ingresar' }}
        </button>
      </form>
      <p v-if="error" class="text-red-500 mt-4 text-center text-sm">{{ error }}</p>
      <div class="mt-4 text-center">
        <router-link to="/register" class="text-blue-500 text-sm">¿No tienes cuenta? Regístrate</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';
    const res = await authStore.login(email.value, password.value);
    loading.value = false;
    if (res.success) {
        router.push('/');
    } else {
        error.value = res.error;
    }
};
</script>