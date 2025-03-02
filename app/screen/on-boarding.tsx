import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';


export default function OnboardingScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    router.replace('/(auth)/option');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.imageContainer}>
        <Image
          source={require('assets/images/job-search.png')} 
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Finding you a dream job is more{'\n'}easier and faster in eDiskarte
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  image: {
    width: '100%',
    height: '80%',
  },
  contentContainer: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#0A1747',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});