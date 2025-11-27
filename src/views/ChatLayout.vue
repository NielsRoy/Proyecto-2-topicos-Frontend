<template>
  <div class="flex h-screen bg-white overflow-hidden">
    
    <aside class="w-72 bg-gray-900 text-gray-300 flex flex-col hidden md:flex border-r border-gray-800">
      <div class="p-4 border-b border-gray-800 flex justify-between items-center">
        <span class="font-bold text-white tracking-wide">Historial</span>
        <button @click="chatStore.fetchHistory" class="text-gray-500 hover:text-white" title="Recargar">
          <ArrowPathIcon class="h-4 w-4" :class="{'animate-spin': chatStore.isLoadingHistory}"/>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
        
        <div v-if="chatStore.isLoadingHistory" class="text-center py-4 text-xs text-gray-600">
          Cargando historial...
        </div>

        <div v-else-if="chatStore.history.length === 0" class="text-xs text-center mt-10 text-gray-600">
          No hay mensajes previos
        </div>

        <button 
          v-for="item in chatStore.history" 
          :key="item.id"
          @click="selectMessage(item)"
          class="w-full text-left p-3 rounded-lg hover:bg-gray-800 cursor-pointer text-sm transition-all group border border-transparent hover:border-gray-700"
        >
          <div class="text-gray-200 font-medium truncate mb-1">
            {{ item.message }}
          </div>
          <div class="text-xs text-gray-500 group-hover:text-gray-400">
            {{ formatDate(item.createdAt) }}
          </div>
        </button>

      </div>

      <div class="p-4 border-t border-gray-800 bg-gray-900">
        <div class="flex items-center gap-3 mb-3 px-2">
            <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {{ authStore.user?.fullName?.charAt(0) || 'U' }}
            </div>
            <div class="flex-1 overflow-hidden">
                <p class="text-xs text-white truncate font-bold">{{ authStore.user?.fullName }}</p>
                <p class="text-[10px] text-gray-500 truncate">{{ authStore.user?.email }}</p>
            </div>
        </div>
        <button @click="authStore.logout" class="w-full flex items-center justify-center gap-2 text-xs py-2 rounded bg-gray-800 hover:bg-red-900/30 hover:text-red-400 transition-colors">
          <ArrowLeftOnRectangleIcon class="h-4 w-4" /> Cerrar Sesión
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full relative">
      <div class="md:hidden p-4 bg-gray-900 text-white flex justify-between items-center shadow-md z-10">
        <span class="font-bold">Social AI</span>
        <button @click="authStore.logout" class="text-xs text-red-300">Salir</button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 scroll-smooth" ref="chatContainer">
        
        <div v-if="chatStore.conversation.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 select-none">
            <div class="bg-white p-6 rounded-full shadow-sm mb-4">
                 <ChatBubbleLeftRightIcon class="h-12 w-12 text-blue-100" />
            </div>
          <p class="font-medium text-gray-500">¿Qué quieres publicar hoy?</p>
        </div>

        <div v-for="msg in chatStore.conversation" :key="msg.id" class="animate-fade-in pb-2">
          
          <div v-if="msg.type === 'user'" class="flex justify-end mb-4">
             <div class="flex flex-col items-end max-w-[85%]">
                <div class="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
                {{ msg.content }}
                </div>
             </div>
          </div>

          <div v-if="msg.type === 'bot_options'" class="flex flex-col items-start w-full animate-slide-up">
            <div class="flex items-center gap-2 mb-3 text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">
              <SparklesIcon class="h-4 w-4 text-amber-500" /> Sugerencias Generadas
            </div>
            
            <div class="flex gap-4 overflow-x-auto w-full pb-6 px-1 snap-x">
              <div v-for="opt in msg.options" :key="opt.publicationId" class="snap-start">
                  <PublicationCard :option="opt" />
              </div>
            </div>
          </div>

          <div v-if="msg.type === 'system_log'" class="flex justify-start w-full animate-fade-in">
             <div :class="['px-4 py-3 rounded-lg border text-sm max-w-lg w-full flex gap-3', msg.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800']">
                <component :is="msg.isError ? ExclamationCircleIcon : CheckCircleIcon" class="h-5 w-5 flex-shrink-0" />
                <div>
                   <p class="font-bold">{{ msg.isError ? 'Error' : 'Éxito' }}</p>
                   <p>{{ msg.content }}</p>
                   <a v-if="msg.url" :href="msg.url" target="_blank" class="text-blue-600 underline mt-1 block font-medium hover:text-blue-800">Ver Publicación &rarr;</a>
                </div>
             </div>
          </div>

        </div>

        <div v-if="chatStore.isGenerating" class="flex items-center gap-2 text-gray-500 text-sm ml-2">
           <div class="loader-dots"></div>
           <span>Procesando...</span>
        </div>
      </div>

      <div class="p-4 bg-white border-t border-gray-200 z-10">
        <form @submit.prevent="sendMessage" class="max-w-4xl mx-auto relative flex gap-3 items-center">
          <input 
            v-model="messageInput"
            type="text" 
            placeholder="Escribe una idea..." 
            class="flex-1 bg-gray-100 text-gray-800 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent focus:border-blue-500 transition-all"
            :disabled="chatStore.isGenerating"
          >
          <button 
            type="submit" 
            :disabled="!messageInput.trim() || chatStore.isGenerating"
            class="bg-gray-900 hover:bg-black text-white rounded-xl p-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
          >
            <PaperAirplaneIcon class="h-5 w-5 transform -rotate-45 translate-x-0.5 -translate-y-0.5" />
          </button>
        </form>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useChatStore } from '../stores/chat';
import PublicationCard from '../components/PublicationCard.vue';
import { 
  ArrowLeftOnRectangleIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid';

const authStore = useAuthStore();
const chatStore = useChatStore();
const messageInput = ref('');
const chatContainer = ref(null);

onMounted(() => {
    // Cargar historial al iniciar el componente
    chatStore.fetchHistory();
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
    }).format(date);
};

const selectMessage = async (item) => {
    // Al hacer click en el sidebar
    await chatStore.loadMessageHistory(item.id, item.message);
};

const sendMessage = async () => {
  if (!messageInput.value.trim()) return;
  const text = messageInput.value;
  messageInput.value = '';
  
  await chatStore.generateContent(text);
  
  // Scrollear al fondo
  await nextTick();
  scrollToBottom();
};

const scrollToBottom = () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

// Auto-scroll simple cuando crece la conversación
watch(() => chatStore.conversation.length, async () => {
    await nextTick();
    scrollToBottom();
});
</script>

<style scoped>
.loader-dots {
  width: 8px;
  height: 8px;
  background: #cbd5e1;
  border-radius: 50%;
  animation: loader 1s infinite alternate;
  box-shadow: 12px 0 #cbd5e1, -12px 0 #cbd5e1;
}
@keyframes loader {
  0% { background-color: #94a3b8; }
  100% { background-color: #cbd5e1; }
}

/* Custom Scrollbar Dark */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>