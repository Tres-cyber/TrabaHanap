import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  FlatList,
  Platform,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SignUpData, handleFormData } from "../../api/signup-request";

const ID_TYPES = [
  { id: "national_id", label: "National ID (PhilSys)" },
  { id: "postal_id", label: "Postal ID" },
  { id: "passport", label: "Passport" },
  { id: "drivers_license", label: "Driver's License" },
];

export default function IDVerification() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    SignUpData({
      idType: selectedID,
      frontImage: frontImage,
      backImage: backImage,
    });

    handleFormData();

    setSuccessModalVisible(true);
  };

  const pickImage = async (type: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const fileSize = result.assets[0].fileSize;
      const maxSize = 1 * 1024 * 1024; // 1MB

      if (fileSize && fileSize > maxSize) {
        alert("Image size exceeds 1MB limit. Please select a smaller image.");
        return;
      }

      if (type === "front") {
        setFrontImage(result.assets[0].uri);
      } else {
        setBackImage(result.assets[0].uri);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000033" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>ID Verification</Text>
        <Text style={styles.subtitle}>Upload your valid government ID</Text>

        {/* ID Type Selection */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.idTypeButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.idTypeButtonText}>
              {selectedID
                ? ID_TYPES.find((id) => id.id === selectedID)?.label
                : "Select ID Type"}
            </Text>
          </TouchableOpacity>
          <View style={styles.inputLine} />
          <Text style={styles.inputLabel}>ID Type</Text>
        </View>

        {/* Front Image Upload */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Front Image</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => pickImage("front")}
          >
            {frontImage ? (
              <Image
                source={{ uri: frontImage }}
                style={styles.uploadedImage}
              />
            ) : (
              <Text style={styles.uploadText}>Upload Front Image</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Image Upload */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Back Image</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={() => pickImage("back")}
          >
            {backImage ? (
              <Image source={{ uri: backImage }} style={styles.uploadedImage} />
            ) : (
              <Text style={styles.uploadText}>Upload Back Image</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedID || !frontImage || !backImage) &&
              styles.submitButtonDisabled,
          ]}
          disabled={!selectedID || !frontImage || !backImage}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Verification</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ID Type Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select ID Type</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ID_TYPES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.idTypeItem}
                  onPress={() => {
                    setSelectedID(item.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.idTypeText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Submitted Successfully</Text>
            <Text style={styles.successMessage}>Wait for the verification</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.push("/sign_in");
              }}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  idTypeButton: {
    paddingVertical: 8,
  },
  idTypeButtonText: {
    fontSize: 16,
    color: "#000",
  },
  inputLine: {
    height: 1,
    backgroundColor: "#000",
    width: "100%",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: "bold",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#000",
  },
  imageUploadButton: {
    height: 200,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  uploadText: {
    fontSize: 16,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#0A1747",
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  idTypeItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  idTypeText: {
    fontSize: 16,
    color: "#000",
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
    borderColor: "#000033",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "80%",
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  successButton: {
    backgroundColor: "#0A1747",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    width: "100%",
  },
  successButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
