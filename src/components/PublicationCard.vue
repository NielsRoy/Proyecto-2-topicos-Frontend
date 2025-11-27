<template>
  <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col min-w-[280px] max-w-[320px] relative">
    
    <div class="flex items-center justify-between mb-3">
      <span class="font-bold text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wide">
        {{ option.socialMedia }}
      </span>
      
      <div v-if="isPublished" class="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
        <CheckBadgeIcon class="h-3 w-3" />
        <span>PUBLICADO</span>
      </div>
      <span v-else class="text-xs text-gray-400">ID: {{ option.publicationId }}</span>
    </div>

    <div class="mb-3 h-40 bg-gray-50 rounded overflow-hidden flex items-center justify-center border border-gray-100">
      <img v-if="isImage" :src="option.fileUrl" class="h-full w-full object-cover hover:scale-105 transition-transform duration-500" alt="Preview">
      <video v-else-if="isVideo" :src="option.fileUrl" controls class="h-full w-full object-cover"></video>
      <span v-else class="text-gray-400 text-xs">Sin vista previa</span>
    </div>

    <div class="flex-grow mb-4 relative group">
      <p class="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scroll pr-1">
        {{ option.textContent }}
      </p>
      <div class="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white to-transparent pointer-events-none group-hover:opacity-0 transition-opacity"></div>
    </div>

    <button 
      @click="handlePublish" 
      :disabled="publishing"
      :class="[
        'w-full py-2 rounded text-sm font-semibold transition-all flex justify-center items-center gap-2 shadow-sm',
        isPublished 
          ? 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50' /* Estilo Republicar */
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md' /* Estilo Publicar Normal */,
        publishing ? 'opacity-70 cursor-not-allowed' : ''
      ]"
    >
      <span v-if="publishing" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
      
      <span v-if="publishing">Procesando...</span>
      <span v-else-if="isPublished">Republicar</span>
      <span v-else>Publicar</span>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useChatStore } from '../stores/chat';
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'; // Asegúrate de tener este icono o usa CheckCircleIcon

const props = defineProps({
  option: Object
});

const store = useChatStore();
const publishing = ref(false);
const locallyPublished = ref(false); // Estado local para feedback inmediato

// Detectamos el tipo de archivo
const isImage = computed(() => props.option.fileUrl?.includes('/images/'));
const isVideo = computed(() => props.option.fileUrl?.includes('/videos/'));

// Unificamos el estado del backend con el estado local reciente
const isPublished = computed(() => {
  return props.option.state === 'PUBLISHED' || locallyPublished.value;
});

const handlePublish = async () => {
    publishing.value = true;
    
    // Llamamos al store
    const success = await store.publishToNetwork(props.option.socialMedia, props.option.publicationId);
    
    publishing.value = false;
    
    if (success) {
        locallyPublished.value = true;
        // Opcional: Si quieres actualizar el objeto "option" real para que persista si cambias de vista, 
        // podrías emitir un evento hacia arriba, pero con 'locallyPublished' basta visualmente por ahora.
    }
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>