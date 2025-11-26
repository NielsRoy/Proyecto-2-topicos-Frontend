<template>
  <div class="flex h-screen bg-white overflow-hidden">
    
    <aside class="w-64 bg-gray-900 text-gray-300 flex flex-col hidden md:flex">
      <div class="p-4 border-b border-gray-700 font-bold text-white">Social AI Manager</div>
      
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        <div v-if="chatStore.promptHistory.length === 0" class="text-xs text-center mt-10 text-gray-500">
          Sin historial reciente
        </div>
        <div 
          v-for="item in chatStore.promptHistory" 
          :key="item.id"
          class="p-3 rounded hover:bg-gray-800 cursor-pointer text-sm truncate transition-colors"
        >
          {{ item.text }}
        </div>
      </div>

      <div class="p-4 border-t border-gray-700">
        <button @click="authStore.logout" class="flex items-center gap-2 text-sm hover:text-white text-red-400">
          <ArrowLeftOnRectangleIcon class="h-5 w-5" /> Cerrar Sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full relative">
      <div class="md:hidden p-4 bg-gray-900 text-white flex justify-between items-center">
        <span class="font-bold">Social AI</span>
        <button @click="authStore.logout" class="text-xs text-red-300">Salir</button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50" ref="chatContainer">
        
        <div v-if="chatStore.conversation.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
          <ChatBubbleLeftRightIcon class="h-16 w-16 mb-4 opacity-20" />
          <p>Escribe un mensaje para generar contenido social.</p>
        </div>

        <div v-for="msg in chatStore.conversation" :key="msg.id" class="animate-fade-in">
          
          <div v-if="msg.type === 'user'" class="flex justify-end">
            <div class="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
              {{ msg.content }}
            </div>
          </div>

          <div v-if="msg.type === 'bot_options'" class="flex flex-col items-start w-full">
            <div class="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
              <SparklesIcon class="h-4 w-4 text-yellow-500" /> AI Suggestions
            </div>
            <div class="flex gap-4 overflow-x-auto w-full pb-4 px-1">
              <PublicationCard 
                v-for="opt in msg.options" 
                :key="opt.publicationId" 
                :option="opt" 
              />
            </div>
          </div>

          <div v-if="msg.type === 'system_log'" class="flex justify-start w-full">
            <div 
              :class="[
                'px-4 py-3 rounded-lg border text-sm max-w-lg w-full',
                msg.isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
              ]"
            >
              <div class="flex gap-2 items-start">
                <CheckCircleIcon v-if="!msg.isError" class="h-5 w-5 mt-0.5" />
                <ExclamationCircleIcon v-else class="h-5 w-5 mt-0.5" />
                <div>
                  <p class="font-medium">{{ msg.isError ? 'Error' : 'Publicación Exitosa' }}</p>
                  <p>{{ msg.content }}</p>
                  <a v-if="msg.url" :href="msg.url" target="_blank" class="text-blue-600 underline mt-1 block">Ver Publicación &rarr;</a>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div v-if="chatStore.isGenerating" class="flex items-start">
           <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
             <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
             <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
             <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
           </div>
        </div>
      </div>

      <div class="p-4 bg-white border-t border-gray-200">
        <form @submit.prevent="sendMessage" class="max-w-4xl mx-auto relative flex gap-2">
          <input 
            v-model="messageInput"
            type="text" 
            placeholder="Describe el contenido que quieres publicar..." 
            class="flex-1 bg-gray-100 text-gray-900 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            :disabled="chatStore.isGenerating"
          >
          <button 
            type="submit" 
            :disabled="!messageInput.trim() || chatStore.isGenerating"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <PaperAirplaneIcon class="h-6 w-6 transform -rotate-45 translate-x-0.5 -translate-y-0.5" />
          </button>
        </form>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatStore } from '../stores/chat';
import PublicationCard from '../components/PublicationCard.vue';
import { 
  ArrowLeftOnRectangleIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/vue/24/solid';

const authStore = useAuthStore();
const chatStore = useChatStore();
const messageInput = ref('');
const chatContainer = ref(null);

const sendMessage = async () => {
  if (!messageInput.value.trim()) return;
  
  const text = messageInput.value;
  messageInput.value = ''; // Limpiar input inmediatamente
  await chatStore.generateContent(text);
};

// Auto-scroll al fondo cuando cambia la conversación
watch(
  () => chatStore.conversation.length, 
  async () => {
    await nextTick();
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }
);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>