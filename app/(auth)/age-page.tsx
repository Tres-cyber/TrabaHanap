import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BirthdayEntryScreen() {
  const router = useRouter();
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthday.getFullYear();
    const monthDifference = today.getMonth() - birthday.getMonth();
    
    if (
      monthDifference < 0 || 
      (monthDifference === 0 && today.getDate() < birthday.getDate())
    ) {
      calculatedAge--;
    }
    
    return calculatedAge;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthdate;
    
    if (currentDate) {
      setBirthdate(currentDate);
      const calculatedAge = calculateAge(currentDate);
      setAge(calculatedAge);
      setError('');
    }
  };

  const handleNext = (): void => {
    if (!birthdate) {
      setError('Please select your birthdate');
      return;
    }
    
    if (age && age < 18) {
      setError('You must be at least 18 years old');
      return;
    }
    
    router.push({
      pathname: '/(auth)/address-page',
      params: { 
        birthdate: birthdate.toISOString(),
        age: age?.toString() 
      }
    });
  };

  const handleBack = (): void => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000033" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>When were you born?</Text>
        <Text style={styles.subtitle}>Select your birthdate</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthdate</Text>
            <View style={[
              styles.input, 
              error ? styles.inputError : null
            ]}>
              <DateTimePicker
                testID="dateTimePicker"
                value={birthdate || new Date()}
                mode="date"
                is24Hour={true}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            </View>
            
            {age !== null && (
              <Text style={styles.ageText}>
                Age: {age} years old
              </Text>
            )}
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 14,
  },
  ageText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#000033',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});