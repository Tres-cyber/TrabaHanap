import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  FlatList
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  date: string;
  anonymousName: string;
}

// Sample feedback data (this should be replaced with actual data from your backend)
const allFeedbacks: Feedback[] = [
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
  },
  {
    id: "4",
    rating: 5,
    comment: "Very reliable and professional. Will definitely hire again!",
    date: "2024-03-01",
    anonymousName: "Anonymous Client"
  },
  {
    id: "5",
    rating: 4,
    comment: "Great work ethic and communication skills.",
    date: "2024-02-25",
    anonymousName: "Anonymous Client"
  },
  {
    id: "6",
    rating: 5,
    comment: "Exceeded expectations in every way possible.",
    date: "2024-02-20",
    anonymousName: "Anonymous Client"
  }
];

const ViewAllFeedbacks: React.FC = () => {
  const router = useRouter();

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

  const renderFeedbackItem = ({ item }: { item: Feedback }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackAnonymousName}>{item.anonymousName}</Text>
        {renderFeedbackStars(item.rating)}
      </View>
      <Text style={styles.feedbackComment}>{item.comment}</Text>
      <Text style={styles.feedbackDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Feedbacks</Text>
      </View>

      <FlatList
        data={allFeedbacks}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedbackList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  feedbackList: {
    padding: 16,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    lineHeight: 20,
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default ViewAllFeedbacks; 