import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TextInput,
  TouchableWithoutFeedback,
  StatusBar,
  Image,
  Platform
} from 'react-native';
import { 
  Filter, 
  Search,
  User
} from 'lucide-react-native';

type Message = { 
  id: string; 
  name: string; 
  preview: string; 
  status: 'Active' | 'Pending'; 
  date: string; 
  profilePic?: string;
};

const initialMessages: Message[] = [
  { 
    id: '1', 
    name: 'Eugenio Galamay III', 
    preview: 'Hi! Are you interested in the project we discussed earlier? I have some updates and would like to go over the details with you when you have a moment.', 
    status: 'Active',
    date: 'March 17, 2025',
    profilePic: 'https://example.com/profile1.jpg'
  },
  { 
    id: '2', 
    name: 'Eugenio Galamay III', 
    preview: 'Hi! Are you interested in the project we discussed earlier? I have some updates and would like to go over the details with you when you have a moment.', 
    status: 'Pending',
    date: 'March 17, 2025',
    profilePic: 'https://example.com/profile2.jpg'
  },
  { 
    id: '3', 
    name: 'Eugenio Galamay III', 
    preview: 'Hi! Are you interested in the project we discussed earlier? I have some updates and would like to go over the details with you when you have a moment.', 
    status: 'Active',
    date: 'March 17, 2025',
    profilePic: 'https://example.com/profile3.jpg'
  }
];

const MessageScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [chatOptionsModalVisible, setChatOptionsModalVisible] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const filteredMessages = messages.filter(msg => {
    if (selectedFilter === 'All') return true;
    return msg.status === selectedFilter;
  });

  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity 
      style={styles.messageContainer}
      onLongPress={() => {
        setSelectedMessage(item);
        setChatOptionsModalVisible(true);
      }}
    >
      {item.profilePic ? (
        <Image 
          source={{ uri: item.profilePic }} 
          style={styles.avatarPlaceholder} 
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={24} color="#999" />
        </View>
      )}
      <View style={styles.messageContent}>
        <Text style={styles.messageName}>{item.name}</Text>
        <Text 
          style={styles.messagePreview} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.preview}
        </Text>
        <Text style={styles.messageDate}>{item.date}</Text>
      </View>
      {item.status === 'Active' && <View style={[styles.statusIndicator, styles.activeStatus]} />}
      {item.status === 'Pending' && <View style={[styles.statusIndicator, styles.pendingStatus]} />}
    </TouchableOpacity>
  );

  const renderChatOptions = () => (
    <View style={styles.messengerModalContent}>
      <TouchableOpacity style={styles.modalOption}>
        <View style={styles.modalOptionIcon}>
          <Text style={styles.modalOptionIconText}>🔇</Text>
        </View>
        <Text style={styles.modalOptionText}>Mute</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modalOption, styles.deleteOption]}>
        <View style={styles.modalOptionIcon}>
          <Text style={styles.modalOptionIconText}>🗑️</Text>
        </View>
        <Text style={[styles.modalOptionText, styles.deleteText]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterModal = () => (
    <View style={styles.messengerModalContent}>
      <TouchableOpacity 
        style={styles.modalOption}
        onPress={() => {
          setSelectedFilter('All');
          setFilterModalVisible(false);
        }}
      >
        <View style={styles.modalOptionIcon}>
          <Text style={styles.modalOptionIconText}>📬</Text>
        </View>
        <Text style={styles.modalOptionText}>All Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.modalOption}
        onPress={() => {
          setSelectedFilter('Active');
          setFilterModalVisible(false);
        }}
      >
        <View style={styles.modalOptionIcon}>
          <Text style={styles.modalOptionIconText}>✅</Text>
        </View>
        <Text style={styles.modalOptionText}>Active Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.modalOption}
        onPress={() => {
          setSelectedFilter('Pending');
          setFilterModalVisible(false);
        }}
      >
        <View style={styles.modalOptionIcon}>
          <Text style={styles.modalOptionIconText}>⏳</Text>
        </View>
        <Text style={styles.modalOptionText}>Pending Messages</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.header, Platform.OS === 'ios' && styles.iosHeader]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search Messages" 
            style={styles.searchInput} 
          />
        </View>
      </View>

      <FlatList
        data={filteredMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
      />

      <Modal
        transparent={true}
        visible={chatOptionsModalVisible}
        animationType="slide"
        onRequestClose={() => setChatOptionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setChatOptionsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              {renderChatOptions()}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              {renderFilterModal()}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingTop: Platform.OS === 'android' ? 50 : 10,
  },
  iosHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontWeight: 'bold',
  },
  messagePreview: {
    color: '#666',
    marginVertical: 5,
  },
  messageDate: {
    color: '#999',
    fontSize: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeStatus: {
    backgroundColor: '#2ecc71', // Bright green
  },
  pendingStatus: {
    backgroundColor: '#f39c12', // Bright orange
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  messengerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  modalOptionIcon: {
    marginRight: 15,
    width: 30,
    alignItems: 'center',
  },
  modalOptionIconText: {
    fontSize: 20,
  },
  modalOptionText: {
    fontSize: 16,
  },
  deleteOption: {},
  deleteText: {
    color: 'red',
  },
});

export default MessageScreen;