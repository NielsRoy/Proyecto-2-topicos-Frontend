<template>
  <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col min-w-[280px] max-w-[320px]">
    <div class="flex items-center justify-between mb-3">
      <span class="font-bold text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{{ option.socialMedia }}</span>
      <span class="text-xs text-gray-400">ID: {{ option.publicationId }}</span>
    </div>

    <div class="mb-3 h-40 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
      <img v-if="isImage" :src="option.fileUrl" class="h-full w-full object-cover" alt="Preview">
      <video v-else-if="isVideo" :src="option.fileUrl" controls class="h-full w-full object-cover"></video>
      <span v-else class="text-gray-400 text-xs">Sin vista previa</span>
    </div>

    <p class="text-sm text-gray-700 mb-4 flex-grow whitespace-pre-wrap max-h-32 overflow-y-auto custom-scroll">
      {{ option.textContent }}
    </p>

    <button 
      @click="handlePublish" 
      :disabled="publishing || published"
      :class="[
        'w-full py-2 rounded text-sm font-semibold transition-colors flex justify-center items-center gap-2',
        published 
          ? 'bg-green-100 text-green-700 cursor-default' 
          : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300'
      ]"
    >
      <span v-if="publishing" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
      {{ published ? 'Publicado' : (publishing ? 'Publicando...' : 'Publicar') }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useChatStore } from '../stores/chat';

const props = defineProps({
  option: Object
});

const store = useChatStore();
const publishing = ref(false);
const published = ref(false);

const isImage = computed(() => props.option.fileUrl?.includes('/images/'));
const isVideo = computed(() => props.option.fileUrl?.includes('/videos/'));

const handlePublish = async () => {
    publishing.value = true;
    const success = await store.publishToNetwork(props.option.socialMedia, props.option.publicationId);
    publishing.value = false;
    if (success) {
        published.value = true;
    }
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
</style>