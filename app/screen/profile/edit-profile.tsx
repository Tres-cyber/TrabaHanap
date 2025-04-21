import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Image,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse full name into components (if available)
  const parseFullName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    let firstName = nameParts[0] || '';
    let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    let middleName = '';
    let suffix = '';
    
    // Check for suffix
    const commonSuffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
    const lastPart = nameParts[nameParts.length - 1];
    if (commonSuffixes.includes(lastPart)) {
      suffix = lastPart;
      lastName = nameParts.length > 2 ? nameParts[nameParts.length - 2] : '';
    }
    
    // Extract middle name if exists
    if (nameParts.length > 2) {
      const middleNameParts = nameParts.slice(1, suffix ? -2 : -1);
      middleName = middleNameParts.join(' ');
    }
    
    return { firstName, middleName, lastName, suffix };
  };
  
  const nameComponents = parseFullName(params.name as string || '');
  
  const [formData, setFormData] = useState({
    firstName: nameComponents.firstName,
    middleName: nameComponents.middleName,
    lastName: nameComponents.lastName,
    suffix: nameComponents.suffix,
    email: params.email as string || '',
    phoneNumber: params.phoneNumber as string || '',
    gender: params.gender as string || '',
    birthday: params.birthday as string || '',
    address: params.address as string || '',
    profilePicture: params.profilePicture as string || 'https://randomuser.me/api/portraits/men/32.jpg'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change profile picture.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData(prev => ({
        ...prev,
        profilePicture: result.assets[0].uri
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Phone Number' },
      { key: 'gender', label: 'Gender' },
      { key: 'birthday', label: 'Birthday' },
      { key: 'address', label: 'Address' }
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field.key as keyof typeof formData]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSavePress = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }
    
    // Show save confirmation modal
    setSaveModalVisible(true);
  };
  
  const handleConfirmSave = () => {
    // Hide modal
    setSaveModalVisible(false);
    
    // Combine name parts back into full name
    const fullName = [
      formData.firstName,
      formData.middleName,
      formData.lastName,
      formData.suffix
    ].filter(Boolean).join(' ');
    
    // Here you would typically send data to your API
    Alert.alert(
      'Success',
      'Profile updated successfully!',
      [
        { 
          text: 'OK', 
          onPress: () => {
            // You would typically update your app's state here
            router.back();
          }
        }
      ]
    );
  };
  
  const handleCancelSave = () => {
    setSaveModalVisible(false);
  };
  
  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <AntDesign name="arrowleft" size={24} color="#0B153C" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSavePress}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleImagePicker}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: formData.profilePicture }} 
                style={styles.profileImage} 
              />
              <View style={styles.editImageButton}>
                <Feather name="camera" size={18} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>First Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Enter your first name"
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Middle Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.middleName ? styles.inputError : null]}
              value={formData.middleName}
              onChangeText={(value) => handleInputChange('middleName', value)}
              placeholder="Enter your middle name"
            />
            {errors.middleName ? <Text style={styles.errorText}>{errors.middleName}</Text> : null}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Last Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Enter your last name"
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Suffix</Text>
            <TextInput
              style={styles.input}
              value={formData.suffix}
              onChangeText={(value) => handleInputChange('suffix', value)}
              placeholder="Jr., Sr., III, etc. (optional)"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gender <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.gender ? styles.inputError : null]}
              value={formData.gender}
              onChangeText={(value) => handleInputChange('gender', value)}
              placeholder="Enter your gender"
            />
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Birthday <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.birthday ? styles.inputError : null]}
              value={formData.birthday}
              onChangeText={(value) => handleInputChange('birthday', value)}
              placeholder="MM/DD/YYYY"
            />
            {errors.birthday ? <Text style={styles.errorText}>{errors.birthday}</Text> : null}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.multilineInput, errors.address ? styles.inputError : null]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>
        </View>
      </ScrollView>
      
      {/* Save Changes Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={saveModalVisible}
        onRequestClose={handleCancelSave}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Changes</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Are you sure you want to save these changes to your profile?
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancelSave}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleConfirmSave}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B153C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0B153C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoText: {
    color: '#0B153C',
    fontSize: 16,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  requiredStar: {
    color: 'red',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: '#0B153C',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f2f6',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#0B153C',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfilePage;