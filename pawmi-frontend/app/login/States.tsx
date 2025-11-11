import React from 'react';
import { StyleSheet, View } from 'react-native';
import HamsterLoader from '../../components/loader';

export function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <HamsterLoader size={200} duration={1200} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
