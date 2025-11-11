import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type FABOption = {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
};

type ExpandableFABProps = {
  options: FABOption[];
  mainButtonColor?: string;
  radius?: number;
};

export default function ExpandableFAB({ 
  options, 
  mainButtonColor = '#ff6f61',
  radius = 150,
}: ExpandableFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const renderOption = (option: FABOption, index: number) => {
    const angle = Math.PI + (index / (options.length - 1)) * (Math.PI / 2);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const optionScale = animation.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 0, 1],
    });

    const optionOpacity = animation.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [0, 0, 1],
    });

    const translateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, x],
    });

    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, y],
    });

    return (
      <Animated.View
        key={`option-${index}`}
        style={[
          styles.optionContainer,
          {
            transform: [
              { translateX },
              { translateY },
              { scale: optionScale }
            ],
            opacity: optionOpacity
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.optionButton, 
            { backgroundColor: option.color || mainButtonColor }
          ]}
          onPress={() => {
            toggleMenu();
            option.onPress();
          }}
        >
          <Feather name={option.icon as any} size={20} color="#fff" />
        </TouchableOpacity>
        <Animated.View 
          style={[
            styles.optionLabelContainer,
            {
              opacity: optionOpacity,
              right: 60,
              top: -10,  
            }
          ]}
        >
          <Text style={styles.optionLabel}>{option.label}</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {options.map(renderOption)}
      <Animated.View 
        style={[
          styles.mainButtonContainer,
          { transform: [{ rotate: rotation }] }
        ]}
      >
        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: mainButtonColor }]}
          onPress={toggleMenu}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  mainButtonContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 3.5,
    elevation: 5,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  optionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  optionLabelContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(45, 45, 45, 0.85)',
    paddingHorizontal: 10,
    marginHorizontal: -15,
    paddingVertical: 5,
    borderRadius: 5,
    zIndex: 100,
  },
  optionLabel: {
    color: 'white',
    fontSize: 12,
  },
});