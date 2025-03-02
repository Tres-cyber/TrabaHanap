import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

type Gender = 'female' | 'male' | 'others' | null;

export default function GenderSelectionScreen() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<Gender>(null);

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
  };

  const handleNext = () => {
    if (selectedGender) {
      router.push({
        pathname: '/(auth)/sign_in',
        params: { gender: selectedGender }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>What's your gender?</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              selectedGender === 'female' && styles.selectedCard
            ]}
            onPress={() => handleSelectGender('female')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require("assets/images/female.png")} 
                style={[styles.iconImage, { tintColor: '#FF4D8D' }]} 
              />
            </View>
            <Text style={styles.optionText}>Female</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              selectedGender === 'male' && styles.selectedCard
            ]}
            onPress={() => handleSelectGender('male')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require("assets/images/male.png")} 
                style={[styles.iconImage, { tintColor: '#4D9EFF' }]} 
              />
            </View>
            <Text style={styles.optionText}>Male</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedGender === 'others' && styles.selectedCard
            ]}
            onPress={() => handleSelectGender('others')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require("assets/images/others.png")} 
                style={[styles.iconImage, { tintColor: '#9E4DFF' }]} 
              />
            </View>
            <Text style={styles.optionText}>Others</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !selectedGender && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedGender}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 60,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 60,
  },
  optionCard: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  selectedCard: {
    borderColor: '#0A1747',
    borderWidth: 2,
    backgroundColor: 'rgba(10, 23, 71, 0.05)',
  },
  iconContainer: {
    marginBottom: 10,
  },
  iconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#0A1747',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});