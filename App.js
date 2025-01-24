import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import Login from './pages/Login';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Login />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2476f3',
  },
});
