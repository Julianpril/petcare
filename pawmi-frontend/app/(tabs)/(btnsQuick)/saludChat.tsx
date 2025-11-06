import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ChatHeader from './(subcomponentes)/ChatHeader';
import ChatInput from './(subcomponentes)/ChatInput';
import ChatMessage from './(subcomponentes)/ChatMessage';
import PetSelector from './(subcomponentes)/PetSelector';
import QuickActions from './(subcomponentes)/QuickActions';
import { formatTime } from './(subcomponentes)/textUtils';
import { Message } from './(subcomponentes)/types';
import TypingIndicator from './(subcomponentes)/TypingIndicator';
import { useChatLogic } from './(subcomponentes)/useChatLogic';


export default function SaludChat() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const {
    messages,
    input,
    setInput,
    isTyping,
    isAnalyzing,
    userPets,
    loadingPets,
    typingAnim,
    sendMessage,
    handlePetSelection,
    clearChat,
  } = useChatLogic();

  const handleQuickAction = (query: string) => {
    setInput(query);
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
