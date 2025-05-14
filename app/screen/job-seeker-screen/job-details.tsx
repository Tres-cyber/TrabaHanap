import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get("window");

export default function JobDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const jobData = {
    title: params.title as string,
    postedDate: params.postedDate as string,
    description: params.description as string,
    rate: params.rate as string,
    location: params.location as string,
    jobDuration: params.jobDuration as string,
    clientId: params.otherParticipant as string,
    clientFirstName: params.clientFirstName as string,
    clientLastName: params.clientLastName as string,
    clientProfileImage: params.clientProfileImage as string,
    images: params.jobImages 
      ? (params.jobImages as string).split(',').map((imgPath) => ({
          uri: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/uploads/${imgPath.split('job_request_files/')[1]}`,
        }))
      : [],
      isMyJob: params.isMyJob as string,
      jobStatus: params.jobStatus as string,
  };

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleApplyNow = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found, redirecting to sign-in...");
        router.push("/sign_in");
        return;
      }

      const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/chat/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          jobId: params.id, 
          clientId: params.otherParticipant,
        }),
      });
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start chat");
      }
  
      console.log("Chat created:", data.chatId);
  
      // Redirect user to the Chat Screen with the chatId
      router.push({
        pathname: "../../../screen/job-seeker-screen/job-seeker-message-screen",
        params: {
          chatId: data.chatId,
          receiverName: data.participantName || `${jobData.clientFirstName} ${jobData.clientLastName}`,
          chatStatus: data.chatStatus || "pending",
          jobId: params.id,
          offerStatus: data.offerStatus || "pending",
          otherParticipantId: params.otherParticipant,
          profileImage: jobData.clientProfileImage,
        },
      });
  
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveSlide(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    if (currentIndex !== activeSlide) {
      setActiveSlide(currentIndex);
    }
  };

  const renderImageItem = ({ item }: { item: { uri: string } }) => (
    <View style={styles.imageItem}>
      <Image source={item} style={styles.carouselImage} resizeMode="cover" />
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back-circle-outline" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={styles.jobInfoCard}>
            <TouchableOpacity 
              style={styles.clientInfoContainer}
              onPress={() => router.push({
                pathname: "../../../screen/profile/view-profile/view-page-client",
                params: { otherParticipantId: jobData.clientId },
              })}
            >
              <Image
                source={
                  jobData.clientProfileImage
                    ? { uri: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${jobData.clientProfileImage}` }
                    : require("assets/images/default-user.png")
                }
                style={styles.clientImage}
              />
              <View style={styles.clientTextContainer}>
                <Text style={styles.clientName}>
                  {`${jobData.clientFirstName} ${jobData.clientLastName}`}
                </Text>
                <Text style={styles.postedDate}>
                  Posted {new Date(jobData.postedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.jobContentContainer}>
              <Text style={styles.jobTitle}>{jobData.title}</Text>
              <Text style={styles.jobDescription}>{jobData.description}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={24} color="#0D2040" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Rate</Text>
                    <Text style={styles.detailValue}>₱ {jobData.rate}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={24} color="#0D2040" />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>{jobData.jobDuration}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={24} color="#0D2040" />
                <Text style={styles.locationText}>{jobData.location}</Text>
              </View>
            </View>
          </View>

          {jobData.images.length > 0 && (
            <View style={styles.imageSliderContainer}>
              <Text style={styles.sectionTitle}>Job Images</Text>
              <FlatList
                ref={flatListRef}
                data={jobData.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderImageItem}
                keyExtractor={(_, index) => index.toString()}
                onScroll={handleScroll}
                snapToInterval={width}
                snapToAlignment="center"
              />
              <View style={styles.paginationContainer}>
                {jobData.images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      activeSlide === index && styles.paginationDotActive,
                    ]}
                    onPress={() => handleDotPress(index)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {jobData.isMyJob !== "true" && 
         jobData.jobStatus !== "pending" && 
         jobData.jobStatus !== "completed" && (
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyNow}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D2040',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  clientInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  clientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  clientTextContainer: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D2040',
    marginBottom: 4,
  },
  jobInfoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D2040',
    marginBottom: 12,
  },
  postedDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  jobDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  jobContentContainer: {
    paddingTop: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 16,
  },
  detailsContainer: {
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D2040',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D2040',
    marginBottom: 12,
  },
  imageSliderContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageItem: {
    width: width,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: width - 64,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ced4da',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0D2040',
    width: 12,
    height: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  applyButton: {
    backgroundColor: '#0D2040',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});