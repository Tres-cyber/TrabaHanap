import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJobListings, deleteJobListing } from "@/api/client-request";

interface JobDetails {
  id: string;
  jobTitle: string;
  jobDescription: string;
  category: string;
  jobLocation: string;
  jobStatus: string;
  budget: string;
  datePosted: string;
}

function reverseCamelCase(str: string) {
  let result = str.replace(/([A-Z])/g, " $1").toLowerCase();
  result = result.replace(/\s+and\b/g, " & ");

  result = result.replace(/(^|\s)([a-z])/g, function (match, space, letter) {
    return space + letter.toUpperCase();
  });

  return result.trim();
}

export default function JobListingScreen() {
  const router = useRouter();
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  const handleProfilePress = () => {
    router.push({
      pathname: "../../../screen/profile/profile-screen" as any,
    });
  };

  const handleSearchPress = () => {};

  const handleNotificationPress = () => {};

  const handleAddJobPress = () => {
    router.push({
      pathname: "../../../screen/client-screen/add-jobs" as any,
    });
  };

  const handleEditJobPress = (jobId: string) => {
    router.push({
      pathname: "../../../screen/client-screen/edit-jobs" as any,
      params: { id: jobId },
    });
  };

  const handleDeleteJobPress = (jobId: string) => {
    setDeleteJobId(jobId);
  };

  const handleConfirmDelete = () => {
    if (deleteJobId) {
      deleteListReload(deleteJobId);
      setDeleteJobId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteJobId(null);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["client-data"],
    queryFn: () => fetchJobListings(),
    refetchOnMount: true,
  });

  const { mutate: deleteListReload } = useMutation({
    mutationFn: deleteJobListing,
    onSuccess: () => {
      refetch();
    },
  });

  const handleCheckToken = async () => {
    const dataToken = await AsyncStorage.getItem("token");

    if (!dataToken) {
      router.replace("/(auth)/sign_in");
    }
  };

  useEffect(() => {
    setTimeout(() => {
      handleCheckToken();
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.header, Platform.OS === 'ios' && styles.iosHeader]}>
        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.profileButton}
        >
          <Image
            source={require("assets/images/client-user.png")}
            style={styles.profileImage}
            defaultSource={require("assets/images/client-user.png")}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
          <Ionicons name="search-outline" size={18} color="#666" />
          <Text style={styles.searchText}>Search jobs here</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNotificationPress}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your Job Listing</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddJobPress}>
          <Feather name="plus" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {!isFetching ? (
          data.map((job: JobDetails) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.jobTitle}</Text>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    onPress={() => handleEditJobPress(job.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="edit" size={18} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteJobPress(job.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.jobDescription}>{job.jobDescription}</Text>

              <View style={styles.jobFooter}>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        job.category === "plumbing" ? "#9b59b6" : "#3498db",
                    },
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {reverseCamelCase(job.category)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: job.jobStatus === "Open" ? "#f39c12" : "#2ecc71",
                    },
                  ]}
                >
                  {job.jobStatus.charAt(0).toUpperCase() +
                    job.jobStatus.slice(1)}
                </Text>

                <Text style={styles.dateText}>
                  {new Date(job.datePosted).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text>
            {" "}
            <ActivityIndicator size="large" />
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteJobId !== null}
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.successModalContainer}>
          <View style={styles.successModalContent}>
            <View style={styles.warningIconContainer}>
              <MaterialIcons name="warning" size={60} color="#FF9500" />
            </View>
            <Text style={styles.successTitle}>Delete Job Listing</Text>
            <Text style={styles.successMessage}>
              Are you sure you want to delete this job listing? This action
              cannot be undone.
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.stayButton}
                onPress={handleCancelDelete}
              >
                <Text style={styles.stayButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.discardButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 50 : 10
  },
  iosHeader: {
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
  },
  profileButton: {
    marginRight: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  notificationButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  addButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobCard: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  jobDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#666",
  },

  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 12,
  },
  successModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  successModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 340,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  warningIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  stayButton: {
    backgroundColor: "#EEEEEE",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  stayButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  discardButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1.5,
    marginLeft: 8,
    alignItems: "center",
  },
  discardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
