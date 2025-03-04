import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const JOB_PREFERENCES = {
  'Repair and Maintenance': [
    'Plumbing', 'Electrical Repairs', 'Carpentry', 
    'Roof Repair', 'Painting Services', 'Welding',
    'Glass Installation', 'Aircon Repair & Cleaning', 
    'Appliance Repair', 'Pest Control Services'
  ],
  'Vehicle Services': [
    'Auto Mechanic', 'Car Wash', 'Motorcycle Repair',
    'Car Aircon Repair', 'Window Tinting'
  ],
  'Housekeeping Services': [
    'Caregiver', 'Personal Driver', 'Gardening',
    'Massage Therapy', 'Pet Grooming & Pet Care', 
    'Home Cleaning Services', 'Laundry Services'
  ]
};

export default function JobPreferenceScreen() {
  const router = useRouter();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const handleTagPress = (tag: string) => {
    setSelectedPreferences(prev => 
      prev.includes(tag) 
        ? prev.filter(item => item !== tag)
        : [...prev, tag]
    );
  };

  const handleNext = () => {
    if (selectedPreferences.length > 0) {
      router.push({
        pathname: '/(auth)/sign_in',
        params: { preferences: JSON.stringify(selectedPreferences) }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderPreferenceSection = (sectionTitle: string, preferences: string[]) => (
    <View style={styles.sectionContainer} key={sectionTitle}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <View style={styles.tagContainer}>
        {preferences.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              selectedPreferences.includes(tag) && styles.selectedTag
            ]}
            onPress={() => handleTagPress(tag)}
          >
            <Text style={[
              styles.tagText,
              selectedPreferences.includes(tag) && styles.selectedTagText
            ]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000033" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Choose your Job Preference</Text>
        <Text style={styles.subtitle}>Find the Perfect Role That Matches Your Skills & Interests</Text>

        {Object.entries(JOB_PREFERENCES).map(([section, preferences]) => 
          renderPreferenceSection(section, preferences)
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedPreferences.length === 0 && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={selectedPreferences.length === 0}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 30,
    borderColor: '#000033',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    marginRight: 10,
  },
  selectedTag: {
    backgroundColor: '#0A1747',
  },
  tagText: {
    color: '#333',
    fontSize: 14,
  },
  selectedTagText: {
    color: 'white',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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