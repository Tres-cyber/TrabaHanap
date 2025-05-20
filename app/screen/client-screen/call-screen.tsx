import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Camera, CameraPermissionStatus, useCameraDevice } from 'react-native-vision-camera';
import { Video, ResizeMode } from 'expo-av';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CallType = 'video' | 'voice';

const CallScreen = () => {
  const router = useRouter();
  const { callType, receiverName, receiverImage } = useLocalSearchParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [hasPermission, setHasPermission] = useState<CameraPermissionStatus>('not-determined');
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');

  // Animation value for pulsing effect
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Start call timer only when connected
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    // Simulate call connection after 2 seconds
    const connectionTimer = setTimeout(() => {
      setCallStatus('connected');
      setIsCallActive(true);
      startPulseAnimation();
    }, 2000);

    return () => {
      clearInterval(timer);
      clearTimeout(connectionTimer);
    };
  }, [callStatus]);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission);
    })();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    router.back();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const renderCallStatus = () => {
    switch (callStatus) {
      case 'connecting':
        return (
          <View style={styles.statusContainer}>
            <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.statusText}>Connecting...</Text>
          </View>
        );
      case 'connected':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{formatTime(callDuration)}</Text>
          </View>
        );
      case 'ended':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Call ended</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Main Video View - Other Participant */}
      {callType === 'video' && callStatus === 'connected' ? (
        <View style={styles.mainVideoContainer}>
          <Video
            source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
            style={styles.mainVideo}
            resizeMode={ResizeMode.COVER}
            isMuted={false}
            shouldPlay={true}
            isLooping={true}
            useNativeControls={false}
          />
          <View style={styles.videoCallStatus}>
            {renderCallStatus()}
          </View>
        </View>
      ) : (
        // Fallback to blurred background image when not connected or not video call
        <View style={styles.background}>
          <Image
            source={{
              uri: receiverImage
                ? `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/uploads/profiles/${(receiverImage + "").split("profiles/")[1] || ""}`
                : undefined,
            }}
            style={styles.backgroundImage}
            blurRadius={10}
          />
        </View>
      )}

      {/* Self View Video Preview - Small overlay */}
      {callType === 'video' && isCameraOn && hasPermission === 'granted' && device && (
        <View style={styles.selfViewContainer}>
          <Camera
            ref={cameraRef}
            style={styles.selfViewVideo}
            device={device}
            isActive={isCameraOn}
            video={true}
            audio={true}

          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndCall} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Receiver Info - Only show for voice calls or when not connected */}
        {(!callType || callType !== 'video' || callStatus !== 'connected') && (
          <View style={styles.receiverInfo}>
            <Image
              source={{
                uri: receiverImage
                  ? `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/uploads/profiles/${(receiverImage + "").split("profiles/")[1] || ""}`
                  : undefined,
              }}
              style={styles.receiverImage}
            />
            <Text style={styles.receiverName}>{receiverName}</Text>
            {renderCallStatus()}
            <Text style={styles.callTypeText}>
              {isCameraOn ? 'Video Call' : 'Voice Call'}
            </Text>
          </View>
        )}

        {/* Call Controls - Keep at bottom */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-low'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {callType === 'video' && (
            <TouchableOpacity
              style={[styles.controlButton, isCameraOn && styles.controlButtonActive]}
              onPress={toggleCamera}
            >
              <Ionicons
                name={isCameraOn ? 'videocam' : 'videocam-off'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlButton, styles.endCallButton]}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  receiverInfo: {
    alignItems: 'center',
    marginTop: 60,
  },
  receiverImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  receiverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: 'center',
  },
  pulseCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    opacity: 1,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  endCallButton: {
    backgroundColor: '#ff3b30',
    transform: [{ rotate: '135deg' }],
  },
  callTypeText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  selfViewContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 100,  // Slightly smaller
    height: 150, // Slightly smaller
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selfViewVideo: {
    width: '100%',
    height: '100%',
  },
  selfViewPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  selfViewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainVideoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  mainVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoCallStatus: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
});

export default CallScreen;



