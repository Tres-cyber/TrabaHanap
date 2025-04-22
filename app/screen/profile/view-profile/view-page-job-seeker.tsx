import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { AntDesign, MaterialCommunityIcons, Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import the achievements data
import achievementsData from '../achievements';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  date: string;
  anonymousName: string;
}

interface WorkerData {
  name: string;
  profileImage: string;
  address: string;
  rating: number;
  completedJobs: number;
  yearsExperience: number;
  skills: string[];
  achievements: Achievement[];
  // Basic info
  email: string;
  phoneNumber: string;
  gender: string;
  birthday: string;
  feedbacks: Feedback[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const UtilityWorkerProfile: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  
  // Sample utility worker data
  const worker: WorkerData = {
    name: "Mike Johnson",
    profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
    address: "286 Oakwood Street, Portland, OR 97205",
    rating: 4.7,
    completedJobs: 138,
    yearsExperience: 8,
    skills: ["Electrical", "Plumbing", "HVAC", "Carpentry", "Emergency Repairs"],
    achievements: achievementsData,
    email: "mike.johnson@example.com",
    phoneNumber: "(503) 555-1234",
    gender: "Male",
    birthday: "April 15, 1985",
    feedbacks: [
      {
        id: "1",
        rating: 5,
        comment: "Excellent work! Very professional and completed the job quickly.",
        date: "2024-03-15",
        anonymousName: "Anonymous Client"
      },
      {
        id: "2",
        rating: 4,
        comment: "Good service, would recommend. Slightly delayed but worth the wait.",
        date: "2024-03-10",
        anonymousName: "Anonymous Client"
      },
      {
        id: "3",
        rating: 5,
        comment: "Amazing attention to detail and very knowledgeable.",
        date: "2024-03-05",
        anonymousName: "Anonymous Client"
      }
    ]
  };

  // Render stars for rating (will be used in info card)
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<AntDesign key={`star-${i}`} name="star" size={20} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<AntDesign key={`star-half`} name="star" size={20} color="#FFD700" style={{opacity: 0.5}} />);
      } else {
        stars.push(<AntDesign key={`star-${i}`} name="staro" size={20} color="#CCCCCC" />);
      }
    }
    
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{stars}</View>
        <Text style={styles.ratingText}>{rating.toFixed(1)} ({worker.completedJobs} jobs)</Text>
      </View>
    );
  };
  
  // Achievement icon mapping
  const getAchievementIcon = (iconName: string) => {
    switch(iconName) {
      case 'trophy':
        return <FontAwesome5 name="trophy" size={24} color="#FFF" />;
      case 'badge':
        return <MaterialCommunityIcons name="certificate" size={24} color="#FFF" />;
      case 'bulb1':
        return <Entypo name="light-bulb" size={24} color="#FFF" />;
      case 'gauge':
        return <MaterialCommunityIcons name="gauge" size={24} color="#FFF" />;
      case 'leaf':
        return <Entypo name="leaf" size={24} color="#FFF" />;
      default:
        return <MaterialCommunityIcons name="medal" size={24} color="#FFF" />;
    }
  };
  
  const handleAboutInfoPress = () => {
    router.push('./about-info');
  };

  // Achievement Card component for reusability
  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <View style={styles.achievementCard}>
      <View style={[styles.badgeIcon, { backgroundColor: achievement.color }]}>
        {getAchievementIcon(achievement.icon)}
      </View>
      <Text style={styles.achievementTitle}>{achievement.title}</Text>
      <Text style={styles.achievementDescription}>{achievement.description}</Text>
    </View>
  );

  const handleFeedbackPress = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setFeedbackModalVisible(true);
  };

  const renderFeedbackStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <AntDesign 
          key={`feedback-star-${i}`} 
          name={i < rating ? "star" : "staro"} 
          size={16} 
          color={i < rating ? "#FFD700" : "#CCCCCC"} 
        />
      );
    }
    return <View style={styles.feedbackStars}>{stars}</View>;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header card is always visible */}
      <View style={styles.header}>
        <Image 
          source={{ uri: worker.profileImage }} 
          style={styles.profileImage} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{worker.name}</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.address}>{worker.address}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.aboutInfoButton}
            onPress={handleAboutInfoPress}
          >
            <Text style={styles.aboutInfoButtonText}>See About Info</Text>
            <AntDesign name="right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="toolbox" size={20} color="#0B153C" />
            <Text style={styles.infoValue}>{worker.completedJobs}</Text>
            <Text style={styles.infoLabel}>Jobs Done</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="certificate" size={20} color="#0B153C" />
            <Text style={styles.infoValue}>{worker.yearsExperience}</Text>
            <Text style={styles.infoLabel}>Years Exp.</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <AntDesign name="star" size={20} color="#0B153C" />
            <Text style={styles.infoValue}>{worker.rating.toFixed(1)}</Text>
            <Text style={styles.infoLabel}>Rating</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Skills & Services</Text>
        </View>
        <View style={styles.skillsContainer}>
          {worker.skills.map((skill, index) => (
            <View 
              key={index} 
              style={styles.skillTag}
            >
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity 
            style={styles.seeAllButton} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <AntDesign name="right" size={16} color="#0B153C" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollView}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {worker.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.horizontalAchievementCard}>
              <View style={[styles.badgeIcon, { backgroundColor: achievement.color }]}>
                {getAchievementIcon(achievement.icon)}
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Feedbacks</Text>
          <TouchableOpacity 
            style={styles.seeAllButton} 
            onPress={() => router.push('./view-all-feedbacks')}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <AntDesign name="right" size={16} color="#0B153C" />
          </TouchableOpacity>
        </View>
        
        {worker.feedbacks.slice(0, 3).map((feedback) => (
          <TouchableOpacity
            key={feedback.id}
            style={styles.feedbackCard}
            onPress={() => handleFeedbackPress(feedback)}
          >
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackAnonymousName}>{feedback.anonymousName}</Text>
              {renderFeedbackStars(feedback.rating)}
            </View>
            <Text style={styles.feedbackComment} numberOfLines={2}>
              {feedback.comment}
            </Text>
            <Text style={styles.feedbackDate}>{feedback.date}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal for "See All" achievements */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Achievements</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={worker.achievements}
              renderItem={({ item }) => <AchievementCard achievement={item} />}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.achievementRow}
              contentContainerStyle={styles.modalAchievementsContainer}
            />
          </View>
        </View>
      </Modal>

      {/* Feedback Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Feedback Details</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setFeedbackModalVisible(false)}
              >
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {selectedFeedback && (
              <View style={styles.feedbackDetailContainer}>
                <View style={styles.feedbackDetailHeader}>
                  <Text style={styles.feedbackDetailName}>{selectedFeedback.anonymousName}</Text>
                  {renderFeedbackStars(selectedFeedback.rating)}
                </View>
                <Text style={styles.feedbackDetailDate}>{selectedFeedback.date}</Text>
                <Text style={styles.feedbackDetailComment}>{selectedFeedback.comment}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#0B153C',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  aboutInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B153C',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  aboutInfoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  ratingContainer: {
    flexDirection: 'row',  
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 40,
    width: 1,
    backgroundColor: '#e0e0e0',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B153C',
    marginRight: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B153C',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  skillText: {
    color: '#fff',
    fontWeight: '500',
  },
  horizontalScrollView: {
    flexGrow: 0,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  horizontalAchievementCard: {
    width: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementRow: {
    justifyContent: 'space-between',
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalAchievementsContainer: {
    padding: 16,
  },
  feedbackCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackAnonymousName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  feedbackStars: {
    flexDirection: 'row',
  },
  feedbackComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999',
  },
  feedbackDetailContainer: {
    padding: 16,
  },
  feedbackDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackDetailDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  feedbackDetailComment: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default UtilityWorkerProfile;