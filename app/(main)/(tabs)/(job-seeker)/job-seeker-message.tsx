import React, { useState,useEffect } from 'react';
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
  Platform,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { 
  Filter, 
  Search,
  User
} from 'lucide-react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter,useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io,{Socket} from 'socket.io-client';


interface Chat {
  id: string;
  participantName: string;
  profileImage: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  chatTitle: string;
  chatStatus: string;
}

const ChatScreen: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [chatOptionsModalVisible, setChatOptionsModalVisible] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { chatId, chatTitle } = useLocalSearchParams();
  
  const fetchChats = async (socketInstance?: Socket) => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        router.replace("/sign_in");
        return;
      }

      const currentSocket = socketInstance || socket;
      if (currentSocket) {
        currentSocket.emit('fetch_user_chats');
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const handleChatPress = (chatId: string,participantName: string,chatStatus:string) => {
    // router.push({
    //   pathname: "/(job-seeker)/chat-room",
    //   params: { chatId,receiverName: participantName,chatStatus: chatStatus },
      
    // });
  };
  const filteredChats = chats.filter(msg => {
    if (selectedFilter === 'All') return true;
    return msg.chatStatus === selectedFilter;
  });


  useEffect(() => {

    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          router.replace("/sign_in");
          return;
        }

        const newSocket = io(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000`, {
          auth: { token }
        });
        newSocket.onAny((event, ...args) => {
          console.log(`📡 Socket event: ${event}`, args);
        });
  
        newSocket.on("new_chat", (data) => {
          setChats(prev => {
            return [data, ...prev];
          });
        });
        newSocket.on('connect', () => {
          fetchChats(newSocket);
        });

        newSocket.on('user_chats_fetched', (fetchedChats: Chat[]) => {
          setChats(fetchedChats);
          setLoading(false);
          setRefreshing(false);
        });


        newSocket.on("chat_updated", (updatedChat: Chat) => {
          setChats((prevChats) => {
            const existingChatIndex = prevChats.findIndex((chat) => chat.id === updatedChat.id);
            let updatedChats;

            if (existingChatIndex !== -1) {
              updatedChats = [...prevChats];
              updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                lastMessage: updatedChat.lastMessage,
                lastMessageTime: updatedChat.lastMessageTime
              };
            } else {
              updatedChats = [updatedChat, ...prevChats];
            }

            return updatedChats.sort((a, b) =>
              new Date(b.lastMessageTime || 0).getTime() -
              new Date(a.lastMessageTime || 0).getTime()
            );
          });
        });

        newSocket.on('user_chats_error', (error) => {
          console.error('Chats fetch error:', error);
          setLoading(false);
          setRefreshing(false);
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      } catch (error) {
        console.error("Error initializing socket:", error);
        setLoading(false);
        setRefreshing(false);
      }
    };

    initializeSocket();


  }, []);

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity 
      style={styles.ChatContainer}

      onLongPress={() => {
        setSelectedChat(item);
        setChatOptionsModalVisible(true);
      }}
    >
      {item.profileImage ? (
        <Image 
          source={{ uri: item.profileImage}} 
          style={styles.avatarPlaceholder} 
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={24} color="#999" />
        </View>
      )}
      <View style={styles.ChatContent}>
        <Text style={styles.ChatName}>{item.participantName}</Text>
        <Text>{item.chatTitle}</Text>
        <Text 
          style={styles.ChatPreview} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.lastMessage || 'No messages yet'}
        </Text>
        <Text style={styles.ChatDate}>{item.lastMessageTime}</Text>
      </View>
      {item.chatStatus === 'approved' && <View style={[styles.statusIndicator, styles.activeStatus]} />}
      {item.chatStatus === 'pending' && <View style={[styles.statusIndicator, styles.pendingStatus]} />}
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
        <Text style={styles.modalOptionText}>All Chats</Text>
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
        <Text style={styles.modalOptionText}>Active Chats</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.modalOption}
        onPress={() => {
          setSelectedFilter('pending');
          setFilterModalVisible(false);
        }}
      >
        <View style={styles.modalOptionIcon}>
          <Text style={styles.modalOptionIconText}>⏳</Text>
        </View>
        <Text style={styles.modalOptionText}>Pending Chats</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, Platform.OS === 'ios' && styles.iosHeader]}>
        <Text style={styles.headerTitle}>Chats</Text>
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
            placeholder="Search Chats" 
            style={styles.searchInput} 
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
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
  ChatContainer: {
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
  ChatContent: {
    flex: 1,
  },
  ChatName: {
    fontWeight: 'bold',
  },
  ChatPreview: {
    color: '#666',
    marginVertical: 5,
  },
  ChatDate: {
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

export default ChatScreen;