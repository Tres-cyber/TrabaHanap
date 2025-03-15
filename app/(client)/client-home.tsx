import React, { useEffect } from "react";
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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { fetchJobListings } from "@/api/client-request";

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

  const handleProfilePress = () => {};

  const handleSearchPress = () => {};

  const handleNotificationPress = () => {};

  const handleAddJobPress = () => {
    router.push({
      pathname: "client-screen/add-jobs" as any,
    });
  };

  const handleEditJobPress = (jobId: string) => {
    router.push({
      pathname: "client-screen/edit-jobs" as any,
      params: { jobId },
    });
  };

  const handleDeleteJobPress = (jobId: string) => {
    console.log(`Deleting job with ID: ${jobId}`);
  };

  const { data, isFetching } = useQuery({
    queryKey: ["client-data"],
    queryFn: fetchJobListings,
  });

  const handleCheckToken = async () => {
    const dataToken = await AsyncStorage.getItem("token");

    if (!dataToken) {
      router.push("/(auth)/sign_in");
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
      <View style={styles.header}>
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
});
