import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/axios';

export const useChatStore = defineStore('chat', () => {
    // Historial lateral (Solo los prompts del usuario)
    const promptHistory = ref([]); 
    
    // Flujo del chat principal (Mensajes usuario, respuestas bot, logs de sistema)
    // Tipos: 'user', 'bot_options', 'system_log'
    const conversation = ref([]); 
    
    const isGenerating = ref(false);

    const addMessageToConversation = (type, content, extra = {}) => {
        conversation.value.push({
            id: Date.now(),
            type,
            content,
            ...extra
        });
    };

    const generateContent = async (message) => {
        if (!message.trim()) return;

        // 1. Agregar mensaje del usuario al chat y al historial
        addMessageToConversation('user', message);
        promptHistory.value.push({ id: Date.now(), text: message });

        isGenerating.value = true;

        try {
            // 2. Llamada al endpoint de generación
            const { data } = await api.post('/publication', { message });
            
            // 3. Agregar respuesta del bot con las opciones
            addMessageToConversation('bot_options', null, { options: data });

        } catch (error) {
            addMessageToConversation('system_log', `Error generando contenido: ${error.message}`, { isError: true });
        } finally {
            isGenerating.value = false;
        }
    };

    const publishToNetwork = async (platform, publicationId) => {
        const endpointMap = {
            'FACEBOOK': '/facebook/publish',
            'INSTAGRAM': '/instagram/publish',
            'LINKEDIN': '/linkedin/publish',
            'WHATSAPP': '/whatsapp/publish',
            'TIKTOK': '/tiktok/publish',
        };

        const url = endpointMap[platform];
        if (!url) return;

        try {
            const { data } = await api.post(url, { publicationId });
            
            // Agregar log de éxito al chat
            if (data.success) {
                addMessageToConversation('system_log', `Publicado exitosamente en ${platform}.`, { 
                    url: data.url, 
                    isError: false 
                });
            } else {
                 throw new Error(data.error || 'Error desconocido');
            }
            return true;

        } catch (error) {
            // Agregar log de error al chat
            addMessageToConversation('system_log', `Fallo al publicar en ${platform}: ${error.message}`, { isError: true });
            return false;
        }
    };

    return { 
        promptHistory, 
        conversation, 
        isGenerating, 
        generateContent, 
        publishToNetwork 
    };
});