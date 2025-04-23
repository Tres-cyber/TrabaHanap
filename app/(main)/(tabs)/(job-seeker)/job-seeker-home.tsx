import React, { useState, useEffect } from "react";
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
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import decodeToken from "@/api/token-decoder";
interface JobRequest {
  id: string;
  jobTitle: string;
  jobSeekerId:string;
  jobDescription: string;
  category: string;
  budget: string;
  jobLocation: string;
  datePosted: string;
  jobImage: string[] | null;
  client:Client;
}
interface Client{
  id:string;
  firstName:string;
  lastName:string;
}
interface JobSeeker {
  jobTags: string[];
}

type TabType = "bestMatch" | "otherJobs" | "pendingJobs";

export default function JobListingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("bestMatch");
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [myJobs, setMyJobs] = useState<JobRequest[]>([]);
  const [jobSeeker, setJobSeeker] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/sign_in");
        return;
      }

      const jobResponse = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/job-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const jobData = await jobResponse.json();
      setJobRequests(jobData);
 
      const myJobsResponse = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/job-seeker/my-jobs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(myJobsResponse);
      const myJobsData = await myJobsResponse.json();
      setMyJobs(myJobsData);

      const tagsResponse = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/job-seeker/tags`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const tagsData = await tagsResponse.json();
      setJobSeeker({ jobTags: tagsData.jobTags || [] });
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      setRefreshing(false);
    }, []),
  );
  const handleMarkAsFinished = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
  
      setLoading(true);
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/jobs/${jobId}/complete`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.ok) {
        // Refresh the jobs list
        await fetchData();
      }
    } catch (error) {
      console.error("Error marking job as finished:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      const loadUserData = async () => {
        try {
          const { data } = await decodeToken();
          const profileImagePath = data.profileImage;

  
          if (profileImagePath) {
            setUserProfileImage(
              `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${profileImagePath}`
            );
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };
      loadUserData();
    }, []);
    
  const handleSeeMorePress = (job: JobRequest) => {
    router.push({
      pathname: "../../../screen/job-seeker-screen/job-details",
      params: {
        id: job.id,
        title: job.jobTitle,
        postedDate: job.datePosted,
        description: job.jobDescription,
        rate: job.budget,
        location: job.jobLocation,
        clientId:job.client.id,
        jobImages: job.jobImage,
      },
    });
  };


  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const matchingJobs = jobRequests.filter((job) =>

    jobSeeker?.jobTags.some(
      (tag) => tag.toLowerCase() === job.category.toLowerCase()
    )
  );
  
  const otherJobs = jobRequests.filter((job) =>
    !jobSeeker?.jobTags.some(
      (tag) => tag.toLowerCase() === job.category.toLowerCase()
    )

  );

  const handleProfilePress = () => {
    router.push("../../../screen/profile/profile-screen");
  };
  
  const handleNotificationPress = () => {
    router.push('/screen/notification-screen');
  };

  const displayedJobs = 
  activeTab === "bestMatch" ? matchingJobs :
  activeTab === "otherJobs" ? otherJobs :
  myJobs;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={[styles.header, Platform.OS === 'ios' && styles.iosHeader]}>
        <TouchableOpacity style={styles.profileButton}  onPress={handleProfilePress}>
          <Image
                     source={
                      userProfileImage
                        ? { uri: userProfileImage }
                        : require("assets/images/default-user.png")
                    }
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#666" />
          <Text style={styles.searchText}>Search jobs here</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>

        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress('bestMatch')}>
          <Text style={[styles.tabText, activeTab === 'bestMatch' && styles.activeTab]}>
            Best Matches

          </Text>
          {activeTab === "bestMatch" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress("otherJobs")}
        >
          <Text
            style={[styles.tabText, activeTab === "otherJobs" && styles.activeTab]}
          >
            Other Jobs
          </Text>
          {activeTab === "otherJobs" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress("pendingJobs")}>
                <Text style={[styles.tabText, activeTab === "pendingJobs" && styles.activeTab]}>
                  My Jobs
                </Text>
                {activeTab === "pendingJobs" && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
              
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
          
          {displayedJobs.length > 0 ? (
            displayedJobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobContent}>
                  <Text style={styles.postedDate}>
                    {new Date(job.datePosted).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.posterName}>{job.client.firstName + " "+ job.client.lastName}</Text>
                  <Text style={styles.jobTitle}>{job.jobTitle}</Text>

                  <Text
                    style={styles.jobDescription}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {job.jobDescription}
                  </Text>
                  <TouchableOpacity onPress={() => handleSeeMorePress(job)}>
                    <Text style={styles.seeMoreText}>See More</Text>
                  </TouchableOpacity>

                  <View style={styles.jobFooter}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{job.category}</Text>
                    </View>
                    <View style={styles.priceLocationContainer}>
                      <Text style={styles.priceText}>₱ {job.budget}</Text>
                      <View style={styles.locationContainer}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#666"
                        />
                        <Text style={styles.locationText}>
                          {job.jobLocation}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.jobImageContainer}>
  
                <Image
                    source={{ 
                      uri: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/uploads/${
                        job.jobImage?.[0]?.split("job_request_files/")?.[1] ?? ''
                      }`
                    }}
                    style={styles.jobImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />
                </View>
                {activeTab === "pendingJobs" && (
                  <TouchableOpacity 
                    style={styles.finishButton}
                    onPress={() => handleMarkAsFinished(job.id)}
                  >
                    <Text style={styles.finishButtonText}>Mark as Finished</Text>
                  </TouchableOpacity>
                )}
               
              </View>
            ))
          ) : (
            <Text style = {styles.noJobs}>No jobs found.</Text>
          )}
          
        </ScrollView>
      )}
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
    paddingTop: Platform.OS === 'android' ? 50 : 10,
  },
  iosHeader:{
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTab: {
    color: "#000",
    fontWeight: "700",
  },
  activeIndicator: {
    height: 3,
    backgroundColor: "#000",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobCard: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    height: 250,
  },
  jobContent: {
    flex: 3,
    padding: 16,
    justifyContent: "space-between",
  },
  jobImageContainer: {
    flex: 1,
    position: "relative",
  },
  jobImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 34, 64, 0.7)",
  },
  postedDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    
  },
  posterName: {
    fontSize: 14,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  jobSubTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  seeMoreText: {
    color: "#3498db",
    fontSize: 14,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "#14213d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  priceLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },  
  noJobs:{
    textAlign:"center",
    marginTop:20,

  },
  finishButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 8,
    zIndex: 2, // Ensure it appears above the image
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
    
  
});
