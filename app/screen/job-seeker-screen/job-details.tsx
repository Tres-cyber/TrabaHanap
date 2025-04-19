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
    clientId:params.clientId as string,
    // images: params.images ? JSON.parse(params.images as string) : [],
    images: params.jobImages 
    ? (params.jobImages as string).split(',').map((imgPath) => ({
        uri: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/uploads/${imgPath.split('job_request_files/')[1]}`,
      }))
    : [],
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
          clientId: params.clientId,
        }),
      });
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start chat");
      }
  
      console.log("Chat created:", data.chatId);
  
      // Redirect user to the Chat Screen with the chatId
      router.push({
        pathname:"../../../(main)/(tabs)/(job-seeker)/job-seeker-message",
        params: { chatId: data.chatId,
          chatTitle: data.chatTitle || jobData.title,
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
          <Text style={styles.jobTitle}>{jobData.title}</Text>
          <Text style={styles.postedDate}>
          {new Date(jobData.postedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          </Text>
          <Text style={styles.jobDescription}>{jobData.description}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rate:</Text>
              <Text style={styles.detailValue}>{jobData.rate}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color="#000" />
              <Text style={styles.locationText}>{jobData.location}</Text>
            </View>
          </View>

          <View style={styles.imageSliderContainer}>
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
              {jobData.images.map((_: any, index: number) => (
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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyNow}>
          <Text style={styles.applyButtonText}>Apply now</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postedDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  jobDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 16,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
  },
  imageSliderContainer: {
    marginVertical: 16,
  },
  imageItem: {
    width: width,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: width - 32, 
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e0e0e0', 
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
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#000',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: '#0D2040',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});