<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Crear Cuenta</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
          <input v-model="fullName" type="text" required class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input v-model="email" type="email" required class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input v-model="password" type="password" required class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button :disabled="loading" type="submit" class="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      <p v-if="error" class="text-red-500 mt-4 text-center text-sm">{{ error }}</p>
      <div class="mt-4 text-center">
        <router-link to="/login" class="text-blue-500 text-sm">¿Ya tienes cuenta? Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const fullName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';
    const res = await authStore.register(fullName.value, email.value, password.value);
    loading.value = false;
    if (res.success) {
        router.push('/');
    } else {
        error.value = res.error;
    }
};
</script>