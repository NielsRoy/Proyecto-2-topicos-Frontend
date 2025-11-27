import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/axios';

export const useChatStore = defineStore('chat', () => {
    const history = ref([]); // Lista de mensajes del sidebar
    const conversation = ref([]); // Chat actual visible
    const isGenerating = ref(false);
    const isLoadingHistory = ref(false);

    // Helper interno para añadir mensajes al chat visible
    const addMessageToConversation = (type, content, extra = {}) => {
        conversation.value.push({
            id: Date.now() + Math.random(), // ID temporal para el v-for frontend
            type,
            content,
            ...extra
        });
    };

    const fetchHistory = async () => {
        isLoadingHistory.value = true;
        try {
            // El endpoint devuelve [ {id, message, createdAt}, ... ]
            // Asumimos que el backend ya los devuelve ordenados por fecha DESC como mostraste
            const { data } = await api.get('/messages?limit=20&offset=0');
            history.value = data;
        } catch (error) {
            console.error("Error cargando historial", error);
        } finally {
            isLoadingHistory.value = false;
        }
    };

    // 2. Cargar una conversación antigua al hacer click
    const loadMessageHistory = async (messageId, originalText) => {
        isGenerating.value = true;
        conversation.value = []; // Limpiamos la vista actual
        
        // Ponemos visualmente el mensaje del usuario primero
        addMessageToConversation('user', originalText);

        try {
            const { data } = await api.get(`/message/${messageId}/publications`);
            
            // Adaptamos la respuesta para que encaje con PublicationCard
            // El endpoint devuelve "id", pero el componente espera "publicationId"
            const adaptedOptions = data.map(pub => ({
                ...pub,
                publicationId: pub.id // Mapeo clave
            }));

            addMessageToConversation('bot_options', null, { options: adaptedOptions });

        } catch (error) {
            addMessageToConversation('system_log', `Error recuperando detalles: ${error.message}`, { isError: true });
        } finally {
            isGenerating.value = false;
        }
    };

    // 3. Generar nuevo contenido (Igual que antes, pero actualizamos historial al final)
    const generateContent = async (message) => {
        if (!message.trim()) return;
        
        // Añadimos mensaje UI inmediatamente
        addMessageToConversation('user', message);
        isGenerating.value = true;

        try {
            const { data } = await api.post('/publication', { message });
            addMessageToConversation('bot_options', null, { options: data });
            
            // Refrescamos el historial para que aparezca el nuevo mensaje arriba en el sidebar
            await fetchHistory(); 

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
            if (data.success) {
                addMessageToConversation('system_log', `Publicado exitosamente en ${platform}.`, { url: data.url, isError: false });
            } else { throw new Error(data.error); }
            return true;
        } catch (error) {
            addMessageToConversation('system_log', `Fallo al publicar en ${platform}: ${error.message}`, { isError: true });
            return false;
        }
    };

    const resetSession = () => {
        history.value = [];
        conversation.value = [];
        isGenerating.value = false;
        isLoadingHistory.value = false;
    };

    return { 
        history, 
        conversation, 
        isGenerating, 
        isLoadingHistory,
        fetchHistory, 
        loadMessageHistory, 
        generateContent, 
        publishToNetwork,
        resetSession 
    };
});