import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Job {
  id: number;
  title: string;
  subTitle: string;
  description: string;
  category: string;
  price: string;
  location: string;
  postedDate: string;
  image?: any; 
}

type TabType = 'suggested' | 'recent';

export default function JobListingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('suggested');

  const handleProfilePress = () => {
  };

  const handleSearchPress = () => {
  };

  const handleNotificationPress = () => {
  };

  const handleSeeMorePress = (jobId: number) => {
    router.push({
        pathname: "job-seeker-screen/job-details" as any,
    });
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };


  const suggestedJobs: Job[] = [
    {
      id: 1,
      title: 'Hiring Maid',
      subTitle: 'ASAP',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ligula nunc, semper ut turpis a.',
      category: 'Electrician',
      price: 'P500',
      location: 'Carig Norte',
      postedDate: 'Posted March 17, 2024',
      image: require('assets/images/ediskarte-logo.png')
    },
    {
      id: 2,
      title: 'Hiring Maid',
      subTitle: 'ASAP',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ligula nunc, semper ut turpis a.',
      category: 'Electrician',
      price: 'P500',
      location: 'Carig Norte',
      postedDate: 'Posted March 17, 2024',
      image: require('assets/images/client-user.png')
    },
    {
      id: 3,
      title: 'Hiring Maid',
      subTitle: 'ASAP',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ligula nunc, semper ut turpis a.',
      category: 'Electrician',
      price: 'P500',
      location: 'Carig Norte',
      postedDate: 'Posted March 17, 2024',
      image: require('assets/images/client-user.png')
    }
  ];

  const recentListings: Job[] = [
    {
      id: 4,
      title: 'Hiring Electrician',
      subTitle: 'Urgent',
      description: 'Need professional electrician for home wiring repair. Experience required. Immediate start.',
      category: 'Electrician',
      price: 'P750',
      location: 'Carig Norte',
      postedDate: 'Posted March 18, 2024',
      image: require('assets/images/client-user.png')
    },
    {
      id: 5,
      title: 'Plumber Needed',
      subTitle: 'Today',
      description: 'Leaking pipe requires immediate attention. Professional plumber with tools needed right away.',
      category: 'Pest Control Services',
      price: 'P600',
      location: 'Carig Norte',
      postedDate: 'Posted March 18, 2024',
      image: require('assets/images/client-user.png')
    }
  ];

 
  const displayedJobs = activeTab === 'suggested' ? suggestedJobs : recentListings;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleProfilePress}
          style={styles.profileButton}
        >
          <Image 
            source={require('assets/images/client-user.png')} 
            style={styles.profileImage}
            defaultSource={require('assets/images/client-user.png')}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={handleSearchPress}
        >
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
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabPress('suggested')}
        >
          <Text style={[styles.tabText, activeTab === 'suggested' && styles.activeTab]}>
            Suggested jobs
          </Text>
          {activeTab === 'suggested' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabPress('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTab]}>
            Recent listing
          </Text>
          {activeTab === 'recent' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {displayedJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobContent}>
              <Text style={styles.postedDate}>{job.postedDate}</Text>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobSubTitle}>{job.subTitle}</Text>
              <Text style={styles.jobDescription} numberOfLines={3} ellipsizeMode="tail">
                {job.description}
              </Text>
              <TouchableOpacity onPress={() => handleSeeMorePress(job.id)}>
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
              
              <View style={styles.jobFooter}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{job.category}</Text>
                </View>
                <View style={styles.priceLocationContainer}>
                  <Text style={styles.priceText}>{job.price}</Text>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.locationText}>{job.location}</Text>
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
        ))}
      </ScrollView>
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