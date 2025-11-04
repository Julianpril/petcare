// components/AdoptarHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type AdoptarHeaderProps = {
  onBackPress: () => void;
};

const AdoptarHeader = ({ onBackPress }: AdoptarHeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress}>
        <Feather name="arrow-left" size={24} color="#EAEAEA" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Adoptar</Text>
      <View style={styles.headerPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E2A38',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EAEAEA',
  },
  headerPlaceholder: {
    width: 34,
  },
});

export default AdoptarHeader;