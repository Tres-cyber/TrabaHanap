import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, 
  SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";

interface JobRequest {
  id: number;
  jobTitle: string;
  jobDescription: string;
  category: string;
  budget: string;
  jobLocation: string;
  datePosted: string;
  image?: any;
}

interface JobSeeker {
  jobTags: string[];
}

type TabType = 'suggested' | 'recent';

export default function JobListingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('suggested');
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [jobSeeker, setJobSeeker] = useState<JobSeeker | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/sign_in");
        return;
      }

      const jobResponse = await fetch("http://192.168.254.111:3000/api/job-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobData = await jobResponse.json();
      setJobRequests(jobData);

      const tagsResponse = await fetch("http://192.168.254.111:3000/api/job-seeker/tags", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tagsData = await tagsResponse.json();
      setJobSeeker({ jobTags: tagsData.jobTags || [] });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSeeMorePress = (job: JobRequest) => {
    router.push({
      pathname: "/job-seeker-screen/job-details",
      params: {
        id: job.id,
        title: job.jobTitle,
        postedDate: job.datePosted,
        description: job.jobDescription,
        rate: job.budget,
        location: job.jobLocation,
        images: JSON.stringify(job.image), 
      },
    });
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
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

  const displayedJobs = activeTab === 'suggested' ? matchingJobs : otherJobs;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton}>
          <Image source={require('assets/images/client-user.png')} style={styles.profileImage} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#666" />
          <Text style={styles.searchText}>Search jobs here</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress('suggested')}>
          <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTab]}>
            Best Matches
          </Text>
          {activeTab === 'suggested' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress('recent')}>
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTab]}>
            Other Jobs
          </Text>
          {activeTab === 'recent' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView style={styles.scrollView}>
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
                  <Text style={styles.jobTitle}>{job.jobTitle}</Text>
         
                  <Text style={styles.jobDescription} numberOfLines={3} ellipsizeMode="tail">
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
                      <Text style={styles.priceText}>{job.budget}</Text>
                      <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.locationText}>{job.jobLocation}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.jobImageContainer}>
              <Image 
                source={job.image} 
                style={styles.jobImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
            </View>
              </View>
              
            ))
          ) : (
            <Text >No jobs found.</Text>
          )}
        </ScrollView>
      )}
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
    paddingVertical: 12,
  },
  profileButton: {
    marginRight: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  notificationButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTab: {
    color: '#000',
    fontWeight: '700',
  },
  activeIndicator: {
    height: 3,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    height: 250, 
  },
  jobContent: {
    flex: 3,
    padding: 16,
    justifyContent: 'space-between',
  },
  jobImageContainer: {
    flex: 1,
    position: 'relative',
  },
  jobImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 34, 64, 0.7)', 
  },
  postedDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  jobSubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  seeMoreText: {
    color: '#3498db',
    fontSize: 14,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#14213d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  priceLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
});