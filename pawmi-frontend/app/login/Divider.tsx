import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DividerProps {
  text: string;
}

export function Divider({ text }: DividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A3340',
  },
  text: {
    color: '#AAB4C0',
    paddingHorizontal: 12,
    fontSize: 12,
  },
});
