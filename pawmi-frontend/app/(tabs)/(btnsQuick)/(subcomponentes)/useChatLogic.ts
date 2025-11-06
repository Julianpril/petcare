/**
 * Hook personalizado para manejar la lógica del chat
 */

import { apiClient } from '@/lib/api-client';
import { diseaseApi } from '@/lib/disease-api';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import {
    GUIDED_QUESTIONS,
    NEGATIVE_KEYWORDS,
    SKIP_KEYWORDS,
    SYMPTOM_KEYWORDS,
    SymptomOverrides
} from './constants';
import { extractAnswersFromConversation } from './petDataUtils';
import { findNextQuestionIndex } from './questionUtils';
import { detectSymptomsFromText } from './symptomDetection';
import { normalizeText, parseYesNo } from './textUtils';
import { Message, Pet } from './types';

export const useChatLogic = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! 👋 Soy tu asistente veterinario virtual 💙\n\nEstoy aquí para ayudarte a cuidar de tu pelud@ 🐾\n\n✨ Selecciona quién necesita atención:', 
      from: 'bot',
      type: 'pet-selector',
      pets: [],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [guidedMode, setGuidedMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  
  const typingAnim = useRef(new Animated.Value(0)).current;
  const guidedOverridesRef = useRef<SymptomOverrides>({});
  const conversationLogRef = useRef<string[]>([]);
  const predictionSessionRef = useRef(0);
  const pendingBotMessagesRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    loadUserPets();
  }, []);

  useEffect(() => {
    if (userPets.length > 0 && !selectedPet) {
      setMessages((prev) =>
        prev.map((msg) => 
          msg.id === '1' 
            ? { ...msg, pets: userPets, type: 'pet-selector' }
            : msg
        )
      );
    }
  }, [userPets, selectedPet]);

  useEffect(() => {
    return () => {
      clearPendingBotMessages();
      typingAnim.stopAnimation();
    };
  }, [typingAnim]);

  const loadUserPets = async () => {
    try {
      setLoadingPets(true);
      const pets = await apiClient.getPets();
      setUserPets(pets || []);
    } catch (error) {
      console.error('Error cargando mascotas:', error);
    } finally {
      setLoadingPets(false);
    }
  };

  const startTypingAnimation = () => {
    setIsTyping(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopTypingAnimation = () => {
    setIsTyping(false);
    typingAnim.stopAnimation();
  };

  const clearPendingBotMessages = () => {
    pendingBotMessagesRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    pendingBotMessagesRef.current = [];
  };

  const pushBotMessage = (
    text: string,
    extra?: Partial<Message>,
    delay = 450
  ) => {
    const timeoutId = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text,
          from: 'bot',
          timestamp: new Date(),
          ...extra,
        },
      ]);
      pendingBotMessagesRef.current = pendingBotMessagesRef.current.filter(
        (pendingId) => pendingId !== timeoutId
      );
    }, Math.max(delay, 0));

    pendingBotMessagesRef.current.push(timeoutId);
  };

  const executePrediction = async (overrides: SymptomOverrides = {}) => {
    if (!selectedPet) return;
    if (isAnalyzing) return;

    const mergedOverrides: SymptomOverrides = {
      ...guidedOverridesRef.current,
      ...overrides,
    };

    guidedOverridesRef.current = mergedOverrides;
    const sessionId = predictionSessionRef.current + 1;
    predictionSessionRef.current = sessionId;
    setIsAnalyzing(true);
    startTypingAnimation();
    clearPendingBotMessages();

    const analyzingText = `Perfecto 💙\n\nDéjame analizar con cuidado todo lo que me contaste sobre ${selectedPet.name}... 🔍💭`;
    conversationLogRef.current = [
      ...conversationLogRef.current,
      `Bot: ${analyzingText}`,
    ];
    pushBotMessage(analyzingText, undefined, 0);

    try {
      const conversationContext = conversationLogRef.current.join('\n');
      
      // Extraer respuestas del contexto de conversación
      const answers = extractAnswersFromConversation(conversationContext, selectedPet, mergedOverrides);
      
      // DEBUG: Ver qué se está enviando
      console.log('🐾 Datos de la mascota:', {
        nombre: selectedPet.name,
        especie: selectedPet.species,
        edad: selectedPet.age_years || selectedPet.age,
        raza: selectedPet.breed,
        peso: selectedPet.weight
      });
      console.log('📋 Respuestas enviadas al backend:', answers);
      
      const result = await diseaseApi.predictWithPrediagnosis(answers);

      if (predictionSessionRef.current !== sessionId) {
        return;
      }

      // Formatear respuesta del nuevo sistema
      let conversationalResponse = 'Muy bien, ya revisé toda la información 💙\n\n';
      
      // Alerta de urgencia
      if (result.urgency_alert) {
        conversationalResponse += `⚠️ ${result.urgency_alert}\n\n`;
        conversationalResponse += `Sé que esto puede preocuparte, pero es importante actuar rápido. Estoy aquí para ayudarte 🤗\n\n`;
      }
      
      // Diagnóstico principal
      if (result.predictions.length > 0) {
        const top = result.predictions[0];
        const probability = (top.probability * 100).toFixed(1);
        conversationalResponse += `📋 Basándome en todo lo que me contaste sobre ${selectedPet.name}, `;
        conversationalResponse += `lo más probable es que tenga **${top.disease}** (${probability}% de posibilidad).\n\n`;
        
        // Otras posibilidades
        if (result.predictions.length > 1) {
          conversationalResponse += `También podría ser:\n`;
          result.predictions.slice(1, 3).forEach((pred) => {
            const prob = (pred.probability * 100).toFixed(1);
            conversationalResponse += `• ${pred.disease}: ${prob}%\n`;
          });
          conversationalResponse += `\n`;
        }
      }
      
      // Recomendación
      conversationalResponse += result.recommendation + '\n\n';
      conversationalResponse += `💡 Recuerda: ${result.disclaimer}`;

      const diagnosisMessage: Message = {
        id: Date.now().toString(),
        text: conversationalResponse,
        from: 'bot',
        type: 'diagnosis',
        diagnosisData: {
          predictions: result.predictions.map(p => ({
            disease: p.disease,
            probability: p.probability
          })),
          symptoms_detected: result.detected_symptoms.reduce((acc, symptom) => {
            acc[symptom] = 1;
            return acc;
          }, {} as { [key: string]: number }),
          model_info: {
            accuracy: result.model_accuracy,
            cv_mean: result.model_accuracy,
            total_classes: 10,
            features_used: result.detected_symptoms.length,
            model_type: 'Logistic Regression'
          },
        },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, diagnosisMessage]);
      conversationLogRef.current = [
        ...conversationLogRef.current,
        'Bot: Predicción completada',
      ];
    } catch (error) {
      console.error('Error en predicción:', error);
      if (predictionSessionRef.current !== sessionId) {
        return;
      }
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '😔 Ups, algo no salió bien... No te preocupes, vamos a intentarlo de nuevo juntos 💪\n\nPuedes volver a contarme los síntomas cuando quieras.',
        from: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      conversationLogRef.current = [
        ...conversationLogRef.current,
        'Bot: Error en predicción',
      ];
    } finally {
      if (predictionSessionRef.current === sessionId) {
        stopTypingAnimation();
        setIsAnalyzing(false);
        guidedOverridesRef.current = {};
        setGuidedMode(false);
        setCurrentStepIndex(-1);
      }
    }
  };

  const askQuestion = (startIndex: number, overrides?: SymptomOverrides) => {
    const activeOverrides = overrides ?? guidedOverridesRef.current;
    const nextIndex = findNextQuestionIndex(startIndex, activeOverrides);

    if (nextIndex === -1) {
      executePrediction(activeOverrides);
      return;
    }

    const nextQuestion = GUIDED_QUESTIONS[nextIndex];
    setGuidedMode(true);
    setCurrentStepIndex(nextIndex);
    conversationLogRef.current = [
      ...conversationLogRef.current,
      `Bot: ${nextQuestion.prompt}`,
    ];
    pushBotMessage(nextQuestion.prompt, undefined, 0);
  };

  const startGuidedFlow = (initialDescription: string) => {
    if (!selectedPet) return;

    clearPendingBotMessages();
    guidedOverridesRef.current = {};
    conversationLogRef.current = [];
    conversationLogRef.current.push(
      `Mascota: ${selectedPet.name} (${selectedPet.species || 'Sin especie'})`
    );
    conversationLogRef.current.push(`Usuario: ${initialDescription}`);

    // Detectar síntomas iniciales del texto del usuario
    const initialSymptoms = detectSymptomsFromText(initialDescription);
    guidedOverridesRef.current = initialSymptoms;
    console.log('🎯 Síntomas detectados del texto inicial:', initialSymptoms);

    setGuidedMode(true);
    setCurrentStepIndex(-1);

    const introText = `Perfecto, entiendo 🤗\n\nAhora déjame hacerte algunas preguntitas más específicas para ayudar mejor a ${selectedPet?.name}. Son rápidas, solo unos minutos 💬\n\n✅ Responde: "sí", "no" o "saltar" (si no estás segur@)`;
    conversationLogRef.current.push(`Bot: ${introText}`);
    pushBotMessage(introText, undefined, 200);

    askQuestion(0);
  };

  const handleGuidedResponse = (rawAnswer: string, normalizedAnswer: string) => {
    if (currentStepIndex === -1) {
      askQuestion(0);
      return;
    }

    const currentQuestion = GUIDED_QUESTIONS[currentStepIndex];
    if (!currentQuestion) {
      executePrediction(guidedOverridesRef.current);
      return;
    }

    if (SKIP_KEYWORDS.some((keyword) => normalizedAnswer.includes(keyword))) {
      conversationLogRef.current = [
        ...conversationLogRef.current,
        `Usuario saltó ${currentQuestion.id}`,
      ];
      askQuestion(currentStepIndex + 1, guidedOverridesRef.current);
      return;
    }

    if (currentQuestion.type === 'yesno') {
      const parsed = parseYesNo(rawAnswer);

      if (parsed === null) {
        const clarification = 'No pasa nada 😊 Solo necesito que me respondas con "sí" o "no". También puedes decir "saltar" si no estás segur@.';
        conversationLogRef.current = [
          ...conversationLogRef.current,
          `Bot: Solicité aclaración para ${currentQuestion.id}`,
        ];
        pushBotMessage(clarification, undefined, 200);
        return;
      }

      const features = Array.isArray(currentQuestion.feature)
        ? currentQuestion.feature
        : currentQuestion.feature
          ? [currentQuestion.feature]
          : [];

      const updatedOverrides: SymptomOverrides = {
        ...guidedOverridesRef.current,
      };

      features.forEach((featureKey) => {
        if (featureKey) {
          updatedOverrides[featureKey] = parsed ? 1 : 0;
        }
      });

      guidedOverridesRef.current = updatedOverrides;
      conversationLogRef.current = [
        ...conversationLogRef.current,
        `Registro ${currentQuestion.id}: ${parsed ? 'sí' : 'no'}`,
      ];

      askQuestion(currentStepIndex + 1, updatedOverrides);
      return;
    }

    if (currentQuestion.type === 'freeform') {
      if (
        normalizedAnswer &&
        !NEGATIVE_KEYWORDS.includes(normalizedAnswer)
      ) {
        conversationLogRef.current = [
          ...conversationLogRef.current,
          `Detalle adicional: ${rawAnswer}`,
        ];
      }

      askQuestion(currentStepIndex + 1, guidedOverridesRef.current);
    }
  };

  const sendMessage = () => {
    if (input.trim() === '' || isAnalyzing) return;

    if (!selectedPet) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '⚠️ Por favor, selecciona primero la mascota que necesita atención.',
        from: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const trimmedInput = input.trim();
    const normalizedInput = normalizeText(trimmedInput);
    const wordCount = normalizedInput
      ? normalizedInput.split(' ').filter(Boolean).length
      : 0;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      from: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (guidedMode) {
      conversationLogRef.current = [
        ...conversationLogRef.current,
        `Usuario: ${trimmedInput}`,
      ];
      handleGuidedResponse(trimmedInput, normalizedInput);
      return;
    }

    const hasSymptomKeyword = SYMPTOM_KEYWORDS.some((keyword) =>
      normalizedInput.includes(keyword)
    );
    const wantsNewCase =
      normalizedInput.includes('nuevo caso') ||
      normalizedInput.includes('otro caso') ||
      normalizedInput.includes('nueva consulta') ||
      normalizedInput.includes('otra consulta') ||
      normalizedInput.includes('nueva evaluacion');

    if (wantsNewCase && !hasSymptomKeyword) {
      pushBotMessage(
        'Perfecto, cuéntame qué síntomas ves para comenzar una nueva evaluación.',
        undefined,
        200
      );
      return;
    }

    if (!hasSymptomKeyword && wordCount < 4 && trimmedInput.length < 20) {
      pushBotMessage(
        'Si deseas iniciar un nuevo caso describe al menos un síntoma principal o toca "Limpiar chat".',
        undefined,
        200
      );
      return;
    }

    startGuidedFlow(trimmedInput);
  };

  const handlePetSelection = async (pet: Pet) => {
    stopTypingAnimation();
    clearPendingBotMessages();
    setIsAnalyzing(false);
    setGuidedMode(false);
    setCurrentStepIndex(-1);
    guidedOverridesRef.current = {};
    conversationLogRef.current = [];
    predictionSessionRef.current += 1;
    setSelectedPet(pet);

    const selectionMessage: Message = {
      id: Date.now().toString(),
      text: `Seleccioné a ${pet.name} 🐾`,
      from: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, selectionMessage]);

    const promptText = `¡Perfecto! 💙 Ahora cuéntame con tus propias palabras, ¿qué síntomas has notado en ${pet.name}?\n\n✨ Por ejemplo: "tiene fiebre, no quiere comer y está muy decaído"\n\n(No te preocupes, luego te haré algunas preguntitas más específicas)`;
    pushBotMessage(promptText, undefined, 350);
  };

  const clearChat = () => {
    stopTypingAnimation();
    clearPendingBotMessages();
    setIsAnalyzing(false);
    setGuidedMode(false);
    setCurrentStepIndex(-1);
    guidedOverridesRef.current = {};
    conversationLogRef.current = [];
    predictionSessionRef.current += 1;
    setMessages([
      { 
        id: '1', 
        text: '¡Hola! 👋 Soy tu asistente veterinario virtual 💙\n\nEstoy aquí para ayudarte a cuidar de tu pelud@ 🐾\n\n✨ Selecciona quién necesita atención:', 
        from: 'bot',
        type: 'pet-selector',
        pets: userPets,
        timestamp: new Date(),
      },
    ]);
    setInput('');
    setSelectedPet(null);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isTyping,
    isAnalyzing,
    userPets,
    loadingPets,
    selectedPet,
    typingAnim,
    sendMessage,
    handlePetSelection,
    clearChat,
  };
};
