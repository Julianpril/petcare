import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const Loader = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const ballTranslateY = bounceAnim.interpolate({
    inputRange: [0, 0.4, 0.6, 1],
    outputRange: [0, -30, -35, -110] 
  });

  const ballScaleX = bounceAnim.interpolate({
    inputRange: [0, 0.4, 0.6, 1],
    outputRange: [1, 0.8, 1, 1]
  });

  const ballScaleY = bounceAnim.interpolate({
    inputRange: [0, 0.4, 0.6, 1],
    outputRange: [0.7, 1.2, 1, 1]
  });

  const bars = [];
  for (let i = 0; i < 4; i++) {
    const opacity = stepAnim.interpolate({
      inputRange: [0, i/4, (i+1)/4, 1],
      outputRange: [i === 0 ? 1 : 0, 1, 0, i === 3 ? 0 : 1],
      extrapolate: 'clamp',
    });

    bars.push(
      <Animated.View 
        key={i} 
        style={[
          styles.bar, 
          { 
            opacity,
            left: 70 - (i * 35) 
          }
        ]} 
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loader}>
        {bars}
        <Animated.View
          style={[
            styles.ball,
            {
              transform: [
                { translateY: ballTranslateY },
                { scaleX: ballScaleX },
                { scaleY: ballScaleY },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'relative',
    width: 120,
    height: 90,
  },
  ball: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#2a9d8f',
  },
  bar: {
    position: 'absolute',
    height: 7,
    width: 45,
    borderRadius: 4,
    backgroundColor: '#f2f2f2',
    top: 0,
  }
});

export default Loader;