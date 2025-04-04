import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  Image,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { 
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Send,
  Phone,
  Video,
  Info,
  AlertCircle,
  Bell,
  X,
  Trash2,
  UserX,
  Flag,
  Check,
  XCircle,
  User,
  DollarSign
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Message = {
  id: string;
  text: string;
  time: string;
  type: 'sent' | 'received' | 'system';
  senderPic?: string;
};

type ChatProps = {
  recipientId?: string;
  recipientName?: string;
  recipientPic?: string;
  chatRequestStatus?: 'pending' | 'accepted' | 'rejected';
};

const ChatScreen: React.FC<ChatProps> = ({ 
  recipientId = '1',
  recipientName = 'Ken Robbie Galapate', 
  recipientPic = 'https://randomuser.me/api/portraits/men/1.jpg',
  chatRequestStatus = 'pending'
}) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [chatStatus, setChatStatus] = useState(chatRequestStatus);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [offerStatus, setOfferStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [offerAmount] = useState('$50.00'); // Define the money offer amount
  const [acceptOfferConfirmationVisible, setAcceptOfferConfirmationVisible] = useState(false);
  
  // Initialize with mock conversation
  useEffect(() => {
    if (chatStatus === 'accepted') {
      const mockConversation: Message[] = [
        {
          id: '1',
          text: "Hi there! I saw your profile and I'm interested in your photography skills.",
          time: '9:30 AM',
          type: 'received',
          senderPic: recipientPic
        },
        {
          id: '2',
          text: "Hello! Thanks for reaching out. What type of photography project do you have in mind?",
          time: '9:32 AM',
          type: 'sent',
          senderPic: 'https://randomuser.me/api/portraits/women/3.jpg'
        },
        {
          id: '3',
          text: "I need some professional product photos for my online store. Would you be available for a session next week?",
          time: '9:35 AM',
          type: 'received',
          senderPic: recipientPic
        },
        {
          id: '5',
          text: "Yes, I'd be happy to help with your product photography. I have availability on Tuesday and Thursday next week.",
          time: '9:38 AM',
          type: 'sent',
          senderPic: 'https://randomuser.me/api/portraits/women/3.jpg'
        },
        {
          id: '6',
          text: "Great! Thursday works best for me. Can we meet at my studio around 2 PM?",
          time: '9:40 AM',
          type: 'received',
          senderPic: recipientPic
        }
      ];
      
      setMessages(mockConversation);
    }
  }, [chatStatus, offerAmount, recipientName, recipientPic]);
  
  const getPendingMenuOptions = () => [
    { icon: <User size={18} color="#777" />, label: 'View Profile' }
  ];
  
  const getAcceptedMenuOptions = () => [
    { icon: <Bell size={18} color="#777" />, label: 'Mute' },
    { icon: <Trash2 size={18} color="#777" />, label: 'Delete conversation' },
    { icon: <UserX size={18} color="#777" />, label: 'Block' }
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleMenuModal = () => {
    if (menuModalVisible) {
    
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start(() => setMenuModalVisible(false));
    } else {
      setMenuModalVisible(true);
     
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();
    }
  };

  const handleAcceptChat = () => {
    setChatStatus('accepted');
    // Show offer modal after accepting chat
    setTimeout(() => {
      setOfferModalVisible(true);
    }, 500);
  };

  const handleRejectChat = () => {
    setRejectModalVisible(true);
  };

  const confirmRejectChat = () => {
    setChatStatus('rejected');
    setRejectModalVisible(false);
    
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  const handleInitiateAcceptOffer = () => {
    // Show the confirmation modal instead of accepting immediately
    setAcceptOfferConfirmationVisible(true);
  };

  const handleAcceptOffer = () => {
    // Close confirmation modal
    setAcceptOfferConfirmationVisible(false);
    
    // Process the offer acceptance
    setOfferStatus('accepted');
    setOfferModalVisible(false);
    
    // Add the system message about accepting the offer
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: `You accepted the ${offerAmount} payment offer from ${recipientName}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
    };
    
    // Add to messages array
    setMessages([...messages, systemMessage]);
  };

  const handleRejectOffer = () => {
    setOfferStatus('rejected');
    setOfferModalVisible(false);
    
    // Add a system message about rejecting the offer
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: `You declined the ${offerAmount} payment offer from ${recipientName}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
    };
    
    // Add to messages array
    setMessages([...messages, systemMessage]);
  };

  const sendMessage = () => {
    if (inputMessage.trim().length === 0) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'sent',
      senderPic: 'https://randomuser.me/api/portraits/women/3.jpg'
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    // Handle system messages differently
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageBubble}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
            <Text style={styles.systemMessageTime}>{item.time}</Text>
          </View>
        </View>
      );
    }
    
    // Handle regular sent/received messages
    return (
      <View style={[
        styles.messageRow,
        item.type === 'sent' ? styles.sentMessageRow : styles.receivedMessageRow
      ]}>
        {item.type === 'received' && item.senderPic && (
          <Image 
            source={{ uri: item.senderPic }} 
            style={styles.senderAvatar} 
          />
        )}
        
        <View style={[
          styles.messageBubble,
          item.type === 'sent' ? styles.sentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            item.type === 'sent' ? styles.sentMessageText : styles.receivedMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            item.type === 'sent' ? styles.sentMessageTime : styles.receivedMessageTime
          ]}>
            {item.time}
          </Text>
        </View>
        
        {item.type === 'sent' && item.senderPic && (
          <Image 
            source={{ uri: item.senderPic }} 
            style={styles.senderAvatar} 
          />
        )}
      </View>
    );
  };

  const renderEmptyChat = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
    </View>
  );

  const modalScale = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });

  const modalOpacity = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });


  const menuOptions = chatStatus === 'accepted' ? getAcceptedMenuOptions() : getPendingMenuOptions();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[
        styles.header, 
        Platform.OS === 'ios' ? styles.iosHeader : styles.androidHeader
      ]}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerUserInfo}>
          <Image 
            source={{ uri: recipientPic }} 
            style={styles.recipientAvatar} 
          />
          <Text style={styles.recipientName}>{recipientName}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={toggleMenuModal}
          style={styles.moreButton}
        >
          <MoreVertical size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {chatStatus === 'pending' && (
        <View style={styles.requestBanner}>
          <Text style={styles.requestText}>
            Chat request from {recipientName}
          </Text>
          <View style={styles.requestActions}>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={handleRejectChat}
            >
              <XCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAcceptChat}
            >
              <Check size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {chatStatus === 'accepted' && offerModalVisible && (
        <View style={styles.offerBanner}>
          <View style={styles.offerContent}>
            <DollarSign size={24} color="#0b8043" style={styles.offerIcon} />
            <View style={styles.offerTextContainer}>
              <Text style={styles.offerTitle}>Payment Offer: {offerAmount}</Text>
              <Text style={styles.offerDescription}>
                {recipientName} has sent you a payment offer. Would you like to accept?
              </Text>
            </View>
          </View>
          <View style={styles.offerActions}>
            <TouchableOpacity 
              style={styles.offerRejectButton}
              onPress={handleRejectOffer}
            >
              <XCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.offerAcceptButton}
              onPress={handleInitiateAcceptOffer}
            >
              <Check size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Offer Acceptance Confirmation Modal */}
      <Modal
        transparent
        visible={acceptOfferConfirmationVisible}
        animationType="fade"
        onRequestClose={() => setAcceptOfferConfirmationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmModalTitle}>Accept Offer?</Text>
            <Text style={styles.confirmModalText}>
              Are you sure you want to accept the {offerAmount} payment offer from {recipientName}?
            </Text>
            <Text style={styles.warningText}>
              There's no turning back once you accept this offer.
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setAcceptOfferConfirmationVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.acceptConfirmButton}
                onPress={handleAcceptOffer}
              >
                <Text style={styles.confirmButtonText}>Yes, Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        transparent
        visible={rejectModalVisible}
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalContainer}>
            <Text style={styles.rejectModalTitle}>Reject Chat?</Text>
            <Text style={styles.rejectModalText}>
              Are you sure you want to reject this chat request from {recipientName}?
            </Text>
            <View style={styles.rejectModalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmRejectChat}
              >
                <Text style={styles.confirmButtonText}>Yes, Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        transparent
        visible={menuModalVisible}
        animationType="none"
        onRequestClose={toggleMenuModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={toggleMenuModal}
        >
          <Animated.View 
            style={[
              styles.dropdownMenu,
              { 
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              }
            ]}
          >
            {menuOptions.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.menuOption,
                  index === menuOptions.length - 1 ? styles.lastMenuOption : null
                ]}
                onPress={() => {
                  toggleMenuModal();
              
                }}
              >
                <View style={styles.menuOptionIcon}>
                  {option.icon}
                </View>
                <Text style={styles.menuOptionText}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      
      <FlatList
        data={chatStatus === 'accepted' ? messages : []}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={chatStatus === 'accepted' ? renderEmptyChat : null}
        ref={ref => {
          if (ref && messages.length > 0) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      />
      
      {chatStatus === 'accepted' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.inputContainer}
        >
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={24} color="#999" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Write a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputMessage.trim().length === 0 && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={inputMessage.trim().length === 0}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
      
      {chatStatus === 'rejected' && (
        <View style={styles.rejectedContainer}>
          <AlertCircle size={50} color="#ff3b30" />
          <Text style={styles.rejectedText}>
            You've rejected this chat request
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  iosHeader: {
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
  },
  androidHeader: {
    marginTop: StatusBar.currentHeight || 0,
    paddingTop: 50,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 8,
  },
  messageList: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  sentMessageRow: {
    justifyContent: 'flex-end',
  },
  receivedMessageRow: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 18,
    maxWidth: '70%',
  },
  sentBubble: {
    backgroundColor: '#0b216f', 
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: '#e9e9eb', 
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  sentMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedMessageTime: {
    color: '#8e8e93',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  systemMessageBubble: {
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: '80%',
  },
  systemMessageText: {
    fontSize: 14,
    color: '#636366',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 11,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
    paddingBottom: Platform.OS === 'android' ? 55 : 55,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0b216f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#b0c0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 15,
    width: SCREEN_WIDTH * 0.6, 
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuOption: {
    borderBottomWidth: 0,
  },
  menuOptionIcon: {
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
  },
  requestBanner: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  requestText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: '#34c759', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
  },
  rejectButton: {
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  rejectModalContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmModalContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rejectModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0b8043',
  },
  rejectModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  confirmModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#ff3b30',
    fontWeight: '500',
  },
  rejectModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#0b8043',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rejectedText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  offerBanner: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  offerIcon: {
    marginRight: 10,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b8043',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
  },
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  offerAcceptButton: {
    backgroundColor: '#0b8043', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
  },
  offerRejectButton: {
    backgroundColor: '#8e8e93', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
  }
});

export default ChatScreen;