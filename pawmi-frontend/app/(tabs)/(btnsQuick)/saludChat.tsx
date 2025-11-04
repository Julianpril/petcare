import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { apiClient } from '@/lib/api-client';
import { diseaseApi } from '@/lib/disease-api';

import ChatHeader from './(subcomponentes)/ChatHeader';
import ChatInput from './(subcomponentes)/ChatInput';
import ChatMessage from './(subcomponentes)/ChatMessage';
import PetSelector from './(subcomponentes)/PetSelector';
import QuickActions from './(subcomponentes)/QuickActions';
import { Message, Pet } from './(subcomponentes)/types';
import TypingIndicator from './(subcomponentes)/TypingIndicator';

export default function SaludChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: '¡Hola! 👋 Soy tu asistente veterinario virtual.\n\n🐾 Selecciona la mascota que necesita atención:', 
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
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

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

  const preparePetData = (pet: Pet, userInput: string) => {
    const animalType = (pet.species || pet.animal_type || 'dog').toLowerCase();
    
    let petAge = 1;
    if (pet.age) {
      if (typeof pet.age === 'string') {
        const ageMatch = (pet.age as string).match(/\d+/);
        petAge = ageMatch ? parseInt(ageMatch[0], 10) : 1;
      } else {
        petAge = pet.age as number;
      }
    }
    
    let petWeight = 15;
    if (pet.weight) {
      if (typeof pet.weight === 'string') {
        const weightMatch = (pet.weight as string).match(/[\d.]+/);
        petWeight = weightMatch ? parseFloat(weightMatch[0]) : 15;
      } else {
        petWeight = pet.weight as number;
      }
    }
    
    let lifeStage = 'adulto';
    if (petAge < 1) lifeStage = 'cachorro';
    else if (petAge < 3) lifeStage = 'joven';
    else if (petAge >= 7) lifeStage = 'senior';
    
    return {
      animal_type: animalType,
      size: pet.size || 'medium',
      age: petAge,
      life_stage: lifeStage,
      weight: petWeight,
      bcs: 5,
      body_temperature: 38.5,
      heart_rate: 100,
      respiratory_rate: 25,
      vomitos: 0, diarrea: 0, diarrea_hemorragica: 0, fiebre: 0,
      letargo: 0, deshidratacion: 0, tos: 0, disnea: 0,
      estornudos: 0, secrecion_nasal: 0, secrecion_ocular: 0,
      ulceras_orales: 0, prurito: 0, alopecia: 0, otitis: 0,
      dolor_abdominal: 0, ictericia: 0, hematuria: 0, disuria: 0,
      cojera: 0, rigidez: 0, dolor_articular: 0, convulsiones: 0,
      signos_neurologicos: 0, hipersalivacion: 0, soplo_cardiaco: 0,
      taquipnea: 0,
      fever_objective: 0, tachycardia: 0, disease_cause: 'viral',
      is_chronic: 0, is_seasonal: 0, prevalence: 0.5,
      prognosis: 'good', vaccination_updated: 1,
    };
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      from: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    startTypingAnimation();

    try {
      const petData = preparePetData(selectedPet, userInput);
      const result = await diseaseApi.predictWithOllama({
        user_message: userInput,
        pet_data: petData,
        pet_name: selectedPet.name,
      });

      stopTypingAnimation();

      const diagnosisMessage: Message = {
        id: Date.now().toString(),
        text: result.conversational_response,
        from: 'bot',
        type: 'diagnosis',
        diagnosisData: {
          predictions: result.predictions,
          symptoms_detected: result.symptoms_detected,
          model_info: result.model_info,
        },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, diagnosisMessage]);

    } catch (error) {
      stopTypingAnimation();
      console.error('Error en predicción:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '❌ Ocurrió un error al analizar los síntomas. Por favor, intenta nuevamente.',
        from: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handlePetSelection = async (pet: Pet) => {
    setSelectedPet(pet);

    const selectionMessage: Message = {
      id: Date.now().toString(),
      text: `Seleccioné a ${pet.name} 🐾`,
      from: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, selectionMessage]);

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Perfecto, ahora cuéntame, ¿qué síntomas tiene ${pet.name}? 🩺\n\nPor ejemplo: "tiene fiebre, tos y está decaído"`,
        from: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  const clearChat = () => {
    setMessages([
      { 
        id: '1', 
        text: '¡Hola! 👋 Soy tu asistente veterinario virtual.\n\n🐾 Selecciona la mascota que necesita atención:', 
        from: 'bot',
        type: 'pet-selector',
        pets: userPets,
        timestamp: new Date(),
      },
    ]);
    setInput('');
    setSelectedPet(null);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: Message; index: number }) => {
    if (item.type === 'pet-selector' && item.pets) {
      return (
        <View style={styles.messageContainer}>
          <View style={styles.botAvatarContainer}>
            <Ionicons name="medical" size={20} color="#6366f1" />
          </View>
          <View style={[styles.botBubble, { maxWidth: '85%' }]}>
            <Text style={styles.botText}>{item.text}</Text>
            <PetSelector 
              pets={item.pets} 
              loading={loadingPets}
              onPetSelect={handlePetSelection}
            />
          </View>
        </View>
      );
    }

    return <ChatMessage message={item} formatTime={formatTime} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ChatHeader 
          onBack={() => router.back()} 
          onClear={clearChat}
        />
        
        <QuickActions onActionPress={handleQuickAction} />

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <TypingIndicator 
          isTyping={isTyping}
          isAnalyzing={isAnalyzing}
          typingAnim={typingAnim}
        />

        <ChatInput 
          value={input}
          onChangeText={setInput}
          onSend={sendMessage}
          disabled={isTyping || isAnalyzing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  messagesContainer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  botAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16181d',
    borderWidth: 1,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botBubble: {
    backgroundColor: '#16181d',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  botText: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
});
