import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  type: 'application' | 'job_match';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
  applicantId?: string;
  jobTitle?: string;
  applicantName?: string;
  applicantImage?: string;
}

// Mock data for notifications with proper typing
const mockNotifications: Record<'client' | 'jobseeker', Notification[]> = {
  client: [
    {
      id: '1',
      type: 'application',
      title: 'New Job Application',
      message: 'John Doe applied for your "Plumbing Repair" job',
      timestamp: '2024-03-20T10:30:00',
      read: false,
      jobId: '123',
      applicantId: '456',
      jobTitle: 'Plumbing Repair',
      applicantName: 'John Doe',
      applicantImage: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: '2',
      type: 'application',
      title: 'New Job Application',
      message: 'Jane Smith applied for your "Electrical Installation" job',
      timestamp: '2024-03-20T09:15:00',
      read: true,
      jobId: '124',
      applicantId: '457',
      jobTitle: 'Electrical Installation',
      applicantName: 'Jane Smith',
      applicantImage: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: '3',
      type: 'application',
      title: 'New Job Application',
      message: 'Mike Johnson applied for your "HVAC Maintenance" job',
      timestamp: '2024-03-19T15:45:00',
      read: false,
      jobId: '125',
      applicantId: '458',
      jobTitle: 'HVAC Maintenance',
      applicantName: 'Mike Johnson',
      applicantImage: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  ],
  jobseeker: [
    {
      id: '4',
      type: 'job_match',
      title: 'New Job Match',
      message: 'A new "Plumbing Repair" job matches your skills',
      timestamp: '2024-03-20T11:20:00',
      read: false,
      jobId: '126',
      jobTitle: 'Plumbing Repair'
    },
    {
      id: '5',
      type: 'job_match',
      title: 'New Job Match',
      message: 'A new "Electrical Installation" job matches your skills',
      timestamp: '2024-03-20T08:45:00',
      read: true,
      jobId: '127',
      jobTitle: 'Electrical Installation'
    },
    {
      id: '6',
      type: 'job_match',
      title: 'New Job Match',
      message: 'A new "HVAC Maintenance" job matches your skills',
      timestamp: '2024-03-19T14:30:00',
      read: false,
      jobId: '128',
      jobTitle: 'HVAC Maintenance'
    }
  ]
};

const NotificationScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'client' | 'jobseeker' | null>(null);

  useEffect(() => {
    const loadUserType = async () => {
      try {
        // For testing, let's set a default user type
        const type = 'jobseeker'; // or 'jobseeker' for testing
        setUserType(type);
        setNotifications(mockNotifications[type]);
        console.log('Loaded notifications:', mockNotifications[type]); // Debug log
      } catch (error) {
        console.error('Error loading user type:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserType();
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    if (userType === 'client' && notification.type === 'application') {
      // Navigate to job details with applicant info
      router.push({
        pathname: '/screen/client-screen/client-message-screen',
        params: {
          jobId: notification.jobId,
          applicantId: notification.applicantId,
        },
      });
    } else if (userType === 'jobseeker' && notification.type === 'job_match') {
      // Navigate to job details
      router.push({
        pathname: '/screen/job-seeker-screen/job-details',
        params: {
          id: notification.jobId,
        },
      });
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const getIcon = () => {
      if (userType === 'client') {
        return <MaterialIcons name="person-add" size={24} color="#1877F2" />;
      } else {
        return <MaterialIcons name="work" size={24} color="#1877F2" />;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          </View>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1877F2" />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>
            {userType === 'client'
              ? 'You will see job applications here'
              : 'You will see job matches here'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  notificationList: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F0F2F5',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1877F2',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NotificationScreen; 