import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'bot';
}

export default function SaludChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hola, ¿cómo puedo ayudarte con la salud de tu mascota?', from: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      from: 'user',
    };

    const botMessage: Message = {
      id: Date.now().toString() + '_bot',
      text: getBotResponse(input),
      from: 'bot',
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('tos')) {
      return '🐶 La tos en mascotas puede deberse a varias causas. Recomiendo:\n• Observar su comportamiento\n• Verificar temperatura\n• Consultar veterinario si persiste';
    }
    
    if (lowerQuery.includes('alergia')) {
      return '🤧 Las alergias en mascotas suelen manifestarse con:\n• Picazón en la piel\n• Enrojecimiento\n• Estornudos\n\nConsulta con un veterinario para diagnóstico preciso';
    }
    
    return '🐾 Para cuidar mejor a tu mascota:\n• Mantén su área limpia\n• Proporciona alimentación adecuada\n• Visitas regulares al veterinario\n\n¡Estoy aquí para ayudarte!';
  };

  const clearChat = () => {
    setMessages([
      { id: '1', text: 'Hola, ¿cómo puedo ayudarte con la salud de tu mascota?', from: 'bot' },
    ]);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.from === 'user' ? styles.userBubble : styles.botBubble
    ]}>
      {item.from === 'bot' && <Text style={styles.botAvatar}>🐾</Text>}
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1A293F', '#0D1B2A']}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>PetCare Assistant</Text>
          <TouchableOpacity onPress={clearChat}>
            <Text style={styles.clearText}>Nuevo chat</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#8FA3B8"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#243B53',
  },
  title: {
    color: '#6ED4C8',
    fontSize: 22,
    fontWeight: '700',
  },
  clearText: {
    color: '#8FA3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    paddingVertical: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginVertical: 8,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#1E88E5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#243B53',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  botAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#152536',
    borderRadius: 30,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#6ED4C8',
  },
  sendIcon: {
    color: '#152536',
    fontSize: 20,
    fontWeight: 'bold',
  },
});