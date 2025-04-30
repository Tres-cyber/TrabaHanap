import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SettingsScreen = () => {
  const router = useRouter();
  const [tagalogLanguage, setTagalogLanguage] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleLanguageToggle = () => {
    setTagalogLanguage(!tagalogLanguage);
    // Here you would typically save the language preference
    Alert.alert(
      tagalogLanguage ? 'Language' : 'Wika',
      tagalogLanguage ? 'Switched to English' : 'Pinalitan sa Tagalog'
    );
  };

  const handlePrivacyPolicy = () => {
    // Navigate to privacy policy screen
    router.push('/screen/privacy-policy');
  };

  const handleTermsConditions = () => {
    // Navigate to terms and conditions screen
    router.push('/screen/terms-conditions');
  };

  const handleLogout = () => {
    console.log('logout')
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Add logout logic here
            router.replace('/(auth)/sign_in');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>

      {/* General Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="language" size={24} color="#0B153C" />
            <Text style={styles.settingText}>Tagalog Language</Text>
          </View>
          <Switch
            value={tagalogLanguage}
            onValueChange={handleLanguageToggle}
            trackColor={{ false: "#767577", true: "#0B153C" }}
            thumbColor={tagalogLanguage ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color="#0B153C" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#767577", true: "#0B153C" }}
            thumbColor={notifications ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={24} color="#0B153C" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#767577", true: "#0B153C" }}
            thumbColor={darkMode ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="privacy-tip" size={24} color="#0B153C" />
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <AntDesign name="right" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleTermsConditions}>
          <View style={styles.settingLeft}>
            <Feather name="file-text" size={24} color="#0B153C" />
            <Text style={styles.settingText}>Terms & Conditions</Text>
          </View>
          <AntDesign name="right" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="logout" size={24} color="#FF3B30" />
            <Text style={[styles.settingText, { color: '#FF3B30' }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    marginBottom: 16,
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});

export default SettingsScreen; 