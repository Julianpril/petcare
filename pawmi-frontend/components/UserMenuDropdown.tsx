//components/UserMenuDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface UserMenuDropdownProps {
  visible: boolean;
  onClose: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  avatarUri?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  visible,
  onClose,
  onProfile,
  onSettings,
  onLogout,
  userName = 'Julian Abril',
  userEmail = 'julian@example.com',
  avatarUri = 'https://placekitten.com/100/100',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const menuItems = [
    {
      icon: 'user',
      title: 'Ver perfil',
      subtitle: 'Información personal',
      onPress: () => {
        onProfile();
        onClose();
      },
    },
    {
      icon: 'settings',
      title: 'Configuración',
      subtitle: 'Preferencias de la app',
      onPress: () => {
        onSettings();
        onClose();
      },
    },
    {
      icon: 'log-out',
      title: 'Cerrar sesión',
      subtitle: 'Salir de la aplicación',
      isDestructive: true,
      onPress: () => {
        onLogout();
        onClose();
      },
    },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.userHeader}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  item.isDestructive && styles.destructiveItem,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      item.isDestructive && styles.destructiveIconContainer,
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color={item.isDestructive ? '#ff6f61' : '#47a9ff'}
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text
                      style={[
                        styles.menuItemTitle,
                        item.isDestructive && styles.destructiveText,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={item.isDestructive ? '#ff6f61' : '#AAB4C0'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#1E2A38',
    borderRadius: 16,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#243644',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A4A',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#47a9ff',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#AAB4C0',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  destructiveItem: {
    borderTopWidth: 1,
    borderTopColor: '#2A3A4A',
    marginTop: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(71, 169, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(255, 111, 97, 0.1)',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EAEAEA',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#AAB4C0',
  },
  destructiveText: {
    color: '#ff6f61',
  },
});

export default UserMenuDropdown;