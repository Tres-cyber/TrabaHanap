import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StyleSheet,
  AppState,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

interface Message {
  id: string;
  messageContent: string;
  senderId: string;
  sentAt: string;
  isDelivered?: boolean;
  isSeen?: boolean;
  readBy?: ReadStatus[]
  sender?: {
    id: string;
    name: string;
  };
}
interface ReadStatus {
  id: string;
  readAt: Date | null;
  participantId: string;
  participant?: {
    id: string;
    // Add other participant fields if needed
  };
}

export default function ChatRoomScreen() {
  const router = useRouter();
  const { chatId, receiverName,chatStatus} = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participantName, setParticipantName] = useState(receiverName || "");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentChatStatus, setCurrentChatStatus] = useState('');
  const [userType,setUserType] = useState('client')
  // Fetch initial messages via REST API
  const fetchInitialMessages = async (token: string) => {
    try {
      const response = await axios.get(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sort messages in descending order (most recent first)
      const sortedMessages = response.data.sort((a: Message, b: Message) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
      
      setMessages(sortedMessages);
      return sortedMessages;
    } catch (error) {
      console.error("Error fetching initial messages:", error);
      return [];
    }
  };


  
  useEffect(() => {
    const checkChatStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/chats/${chatId}/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentChatStatus(response.data.status);
        
        // Show modal if current user is client and status isn't approved
        const ua = await AsyncStorage.getItem("userType");
        setUserType(ua+'');
        if (userType === 'client' && response.data.status !== 'approved') {
          setShowApprovalModal(true);
        }
      } catch (error) {
        console.error("Error checking chat status:", error);
      }
    };
  
    checkChatStatus();
  }, [chatId]);
  
  // Add these handler functions
  const handleApprove = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/chats/${chatId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentChatStatus('approved');
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error approving chat:", error);
    }
  };
  
  const handleReject = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/chats/${chatId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentChatStatus('rejected');
      setShowApprovalModal(false);
      router.back(); // Optionally navigate back after rejection
    } catch (error) {
      console.error("Error rejecting chat:", error);
    }
  };


  useEffect(() => {
    if (!socket) return;
  
    // Handle incoming messages with status
    socket.on('receive_message', (message: Message) => {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        
        return [message, ...prev];
      });
    });
  
    // Handle seen updates
    socket.on('message_seen', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId
          ? { ...msg, isSeen: true }
          : msg
      ));
    });

    socket.on("chat_approved", (data) => {
      if (data.status === "approved") {
        setCurrentChatStatus("approved"); 
      }
    });

    socket.on("chat_rejected", (data) => {
      if (data.status === "rejected") {
        setCurrentChatStatus("rejected"); 
      }
    });
  
    return () => {
      socket.off('receive_message');
      socket.off('message_seen');
      socket.off("chat_approved");
      socket.off("chat_rejected");
    };
  }, [socket]);
  
  // Add this to mark messages as seen when chat is opened
  useEffect(() => {
    if (!socket || !chatId || messages.length === 0) return;
  
    // When component mounts, mark messages as seen
    socket.emit('mark_as_seen', { chatId });
    socket.emit('join_chat', { chatId });
    // When user comes back to the chat (from background)
    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        socket.emit('mark_as_seen', { chatId });
      }
    });
  
    return () => {
      appStateListener.remove();
      socket.emit('leave_chat', { chatId });
    };
  }, [socket, chatId]);
  
  useEffect(() => {
    if (!socket || !currentUserId || messages.length === 0) return;
  
    // Get unread messages (where current user is not the sender and not read)
    const unreadMessages = messages.filter(message => 
      String(message.senderId) !== String(currentUserId) && 
      (!message.readBy || message.readBy.length === 0)
    );
  
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id);
      socket.emit('mark_as_read', { messageIds });
    }
  }, [messages, currentUserId, socket]);
  
  // Add listener for messages_read event
  useEffect(() => {
    if (!socket) return;
  
    const handleMessagesRead = ({ messageIds, readStatuses }: { 
      messageIds: string[]; 
      readStatuses: ReadStatus[] 
    }) => {
      setMessages(prev => prev.map(msg => {
        if (!messageIds.includes(msg.id)) {
          return msg;
        }
        
        // Find all read statuses for this message
        const statusesForMessage = readStatuses.filter(rs => rs.id === msg.id);
        
        return {
          ...msg,
          readBy: [...(msg.readBy || []), ...statusesForMessage]
        };
      }));
    };
  
    socket.on('messages_read', handleMessagesRead);
    return () => {
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket]);

  useEffect(() => {
    // Initialize Socket.IO connection
    const initSocket = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found, redirecting to sign-in...");
        router.push("/sign_in");
        return;
      }

      // First, fetch initial messages via REST API
      await fetchInitialMessages(token);

      const newSocket = io(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000`, {
        auth: {
          token: token
        }
      });
    
      newSocket.on('connect', () => {
        // console.log('Socket connected');
        // Join the specific chat room
        newSocket.emit('join_chat', { chatId });
      });

      // Listen for new messages
      newSocket.on('receive_message', (message: Message) => {
        setMessages((prevMessages) => {
          // Prevent duplicate messages
          const isDuplicate = prevMessages.some(msg => msg.id === message.id);
          return isDuplicate 
            ? prevMessages 
            : [message, ...prevMessages];
        });
      });

      setSocket(newSocket);

      // Cleanup socket on component unmount
      return () => {
        newSocket.disconnect();
      };
    };

    // Fetch Current User ID
    const getCurrentUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("currentUserId");
        if (!storedUser) {
          console.warn("⚠ No stored user found.");
          return;
        }
        setCurrentUserId(storedUser);
      } catch (error) {
        console.error("🚨 Error retrieving user:", error);
      }
    };

    getCurrentUser();
    initSocket();
  }, [chatId]);
  

  // Send Message via Socket
  const handleSendMessage = async () => {
    if (messageInput.trim() === "" || !socket) return;

    try {
      const newMessage = {
        chatId,
        messageContent: messageInput,
      };

      // Emit message through socket
      socket.emit('send_message', newMessage);

      // Clear input
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const formatTime = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // For AM/PM format, set to false for 24-hour format
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverName}</Text>
      </View>

      {/* Chat Messages */}
      <FlatList
  data={messages}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => {
    // console.log(`🔍 Message ID: ${item.id}, Sender ID: ${item.senderId}, Current User ID: ${currentUserId}`);
    const isCurrentUser = String(item.senderId) === String(currentUserId);
    const isLastMessage = index === 0; // Since list is inverted
    const showStatus = isCurrentUser && isLastMessage;
    // 🗓 Extract date in "Monday, March 02, 2025" format
    const messageDate = new Date(item.sentAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // 🔍 Fix: Use `index + 1` since FlatList is inverted
    const nextMessageDate = index === messages.length - 1
      ? null
      : new Date(messages[index + 1].sentAt).toDateString();
    
    const currentMessageDate = new Date(item.sentAt).toDateString();

    const showDateSeparator = 
      index === messages.length - 1 || // First item at the bottom in inverted FlatList
      (nextMessageDate && currentMessageDate !== nextMessageDate);

    return (
      <>
        {/* 💬 Chat Bubble */}
        <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.senderBubble : styles.receiverBubble
      ]}>
        <Text style={styles.messageText}>{item.messageContent}</Text>
        {/* {formatTime(item.sentAt)} */}
        {showStatus && (
          <Text style={styles.statusText}>
            {item.isSeen ? 'Seen' : 'Delivered'}
        
          </Text>
        )}
      </View>

        {/* 📅 Fix: Show Date Separator AFTER message */}
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{messageDate}</Text>
          </View>
        )}
      </>
    );
  }}
  inverted
/>




      { currentChatStatus == 'approved' && (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageInput}
          onChangeText={setMessageInput}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>)}

      {userType === 'client' && currentChatStatus === 'pending' && (
      <Modal
      visible={showApprovalModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowApprovalModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Approve this chat?</Text>
          <Text style={styles.modalText}>
            You need to approve this conversation before continuing.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.approveButton]}
              onPress={handleApprove}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
      )}
      {userType === 'jobSeeker' && currentChatStatus === 'pending' && (
  <View style={styles.waitingBanner}>
    <Text style={styles.waitingText}>
      <Ionicons name="time-outline" size={16} /> Waiting for client approval
    </Text>
  </View>
)}

{userType === 'jobSeeker' && currentChatStatus === 'rejected' && (
  <View style={styles.waitingBanner}>
    <Text style={styles.waitingText}>
      <Ionicons name="time-outline" size={16} /> Client rejected your application
    </Text>
  </View>
)}

{userType === 'client' && currentChatStatus === 'rejected' && (
  <View style={styles.waitingBanner}>
    <Text style={styles.waitingText}>
      <Ionicons name="time-outline" size={16} /> You rejected this applicant
    </Text>
  </View>
)}
    </SafeAreaView>
  );
}


// Styles remain the same as in the original code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#fff", elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },

  // Chat bubble styles
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "75%",
  },
  senderBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderTopRightRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  receiverBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ddd",
    borderTopLeftRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },

  // Input field
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    marginLeft: 10,
  },
  dateSeparator: {
    alignSelf: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  readStatusContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  readStatusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statusText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#007AFF',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  waitingBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  waitingText: {
    color: '#856404',
    marginLeft: 8
  }
});

