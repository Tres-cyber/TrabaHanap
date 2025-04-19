import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Share,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  AddCommunityPost,
  fetchCommunityPosts,
  likePost,
  unlikePost,
  checkIfLiked,
  addComment,
  fetchPostComments,
} from "@/api/community-request";
import decodeToken from "@/api/token-decoder";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Simplified types
type Comment = {
  id: string;
  username: string;
  avatar: string | null;
  text: string;
  time: string;
  replies?: Comment[];
  isUpvoted?: boolean;
};

type Post = {
  id: string;
  clientId?: string;
  jobSeekerId?: string;
  postContent: string;
  postImage: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  username: string;
  profileImage?: string;
  isUpvoted?: boolean;
  upvotes?: number;
  comments?: number;
  commentsList?: Comment[];
};

type AddCommentMutation = {
  postId: string;
  comment: {
    comment: string;
    userId: string;
    userType: string;
    parentCommentId?: string | null;
  };
};

const SocialFeedScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newPostText, setNewPostText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(
    null
  );
  const [commentModalVisible, setCommentModalVisible] =
    useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const {
    data: fetchedPosts = [],
    isLoading,
    refetch,
  } = useQuery<Post[]>({
    queryKey: ["community-posts"],
    queryFn: fetchCommunityPosts,
  });

  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ["post-comments", selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return [];
      const formattedComments = await fetchPostComments(selectedPost.id);
      return formattedComments;
    },
    enabled: !!selectedPost,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, comment }: AddCommentMutation) => {
      return await addComment(postId, comment);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await decodeToken();
        const profileImagePath = data.profileImage;
        const userName = `${data.firstName} ${data.middleName[0]}. ${data.lastName}`;

        if (profileImagePath) {
          setUserProfileImage(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${profileImagePath}`
          );
        }
        setUsername(userName);
        setData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    if (fetchedPosts.length > 0) {
      const loadPostLikes = async () => {
        const updatedPosts = await Promise.all(
          fetchedPosts.map(async (post) => {
            try {
              const likeStatus = await checkIfLiked(post.id);
              return {
                ...post,
                isUpvoted: !!likeStatus.likedAt,
                upvotes: post.likeCount || 0,
              };
            } catch (error) {
              console.error(
                "Error checking like status for post:",
                post.id,
                error
              );
              return {
                ...post,
                isUpvoted: false,
                upvotes: post.likeCount || 0,
              };
            }
          })
        );
        setPosts(updatedPosts);
      };
      loadPostLikes();
    }
  }, [fetchedPosts]);

  const navigateToSearch = () => {
    router.push("./");
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const getUsername = async () => {
    const { data } = await decodeToken();
    const userName = `${data.firstName} ${data.middleName[0]}. ${data.lastName}`;
    return userName;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleAddPost = async () => {
    if (newPostText.trim() === "" && !selectedImage) return;

    const newPost: Post = {
      id: Date.now().toString(),
      username: await getUsername(),
      postContent: newPostText,
      postImage: selectedImage || "",
      likeCount: 0,
      commentCount: 0,
      createdAt: Date.now().toString(),
    };

    try {
      await AddCommunityPost(newPost);
      refetch();
      setNewPostText("");
      setSelectedImage(null);
      setShowCreatePost(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handleShare = async (post: Post) => {
    try {
      const postUrl = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${post.id}`;
      const message = `Check out this post from ${post.username}:\n\n${post.postContent}\n\n${postUrl}`;

      const result = await Share.share({
        message,
        title: "Share Post",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share post");
    }
  };

  const toggleUpvote = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // First update the UI optimistically
      const updatedPosts = posts.map((p) => {
        if (p.id === postId) {
          const currentLikeCount = p.likeCount || 0;
          const newIsUpvoted = !p.isUpvoted;
          return {
            ...p,
            isUpvoted: newIsUpvoted,
            likeCount: newIsUpvoted
              ? currentLikeCount + 1
              : Math.max(0, currentLikeCount - 1),
            upvotes: newIsUpvoted
              ? currentLikeCount + 1
              : Math.max(0, currentLikeCount - 1),
          };
        }
        return p;
      });
      setPosts(updatedPosts);

      // Then make the API call
      if (post.isUpvoted) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }

      // Refresh the posts to ensure consistency
      refetch();
    } catch (error) {
      console.error("Error toggling upvote:", error);
      // Revert the UI change on error
      const revertedPosts = posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isUpvoted: p.isUpvoted,
            likeCount: p.likeCount,
            upvotes: p.likeCount,
          };
        }
        return p;
      });
      setPosts(revertedPosts);
      Alert.alert("Error", "Failed to update like status");
    }
  };

  const openCommentModal = (post: Post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPost(null);
    setNewCommentText("");
    setReplyToComment(null);
    setReplyingToUsername(null);
  };

  const handleAddComment = async (postId: string) => {
    if (newCommentText.trim() === "") return;

    const newComment: Comment = {
      id: Date.now().toString(),
      username: username,
      avatar: userProfileImage || "",
      text: newCommentText,
      time: "Just now",
      isUpvoted: false,
      replies: [],
    };

    try {
      await addCommentMutation.mutateAsync({
        postId,
        comment: {
          comment: newCommentText,
          userId: data.id,
          userType: data.userType,
          parentCommentId: replyToComment || null,
        },
      });

      setNewCommentText("");
      setReplyToComment(null);
      setReplyingToUsername(null);
    } catch (error) {
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const startReply = (commentId: string, username: string) => {
    setReplyToComment(commentId);
    setReplyingToUsername(username);
  };

  const cancelReply = () => {
    setReplyToComment(null);
    setReplyingToUsername(null);
  };

  // Rendering functions - modified to remove upvote from comments and reply button from replies
  const renderComment = (comment: Comment, isReply = false, postId: string) => (
    <View
      key={comment.id}
      style={[styles.commentContainer, isReply && styles.replyContainer]}
    >
      <Image
        source={
          comment.avatar
            ? { uri: comment.avatar }
            : require("assets/images/default-user.png")
        }
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentUsername}>{comment.username}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{comment.time}</Text>
          <TouchableOpacity
            onPress={() => startReply(comment.id, comment.username)}
          >
            <Text style={styles.commentAction}>Reply</Text>
          </TouchableOpacity>
        </View>

        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => renderComment(reply, true, postId))}
          </View>
        )}
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => {
    const imageUrl = item.postImage
      ? `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${item.postImage}`
      : null;

    const profileImageUrl = item.profileImage
      ? `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${item.profileImage}`
      : null;

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require("assets/images/default-user.png")
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.content}>{item.postContent}</Text>

        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {item.likeCount} Likes • {item.commentCount} Comments
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleUpvote(item.id)}
          >
            <Ionicons
              name={item.isUpvoted ? "heart" : "heart-outline"}
              size={20}
              color={item.isUpvoted ? "#0077B5" : "#666"}
            />
            <Text
              style={[
                styles.actionText,
                item.isUpvoted ? styles.activeActionText : null,
              ]}
            >
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openCommentModal(item)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-social-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === "android" && styles.androidContainer,
      ]}
    >
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={navigateToSearch}>
          <Ionicons name="search" size={24} color="#0b216f" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createPostTrigger}
        onPress={() => setShowCreatePost(true)}
      >
        <Image
          source={
            userProfileImage
              ? { uri: userProfileImage }
              : require("assets/images/default-user.png")
          }
          style={styles.userAvatar}
        />
        <View style={styles.createPostPlaceholder}>
          <Text style={styles.createPostText}>
            Share a professional update...
          </Text>
        </View>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0077B5" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item, index }) => (
            <View key={`post-${item.id || index}`}>{renderPost({ item })}</View>
          )}
          keyExtractor={(item, index) => `post-${item.id || index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0077B5"]}
              tintColor="#0077B5"
            />
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={showCreatePost}
        onRequestClose={() => setShowCreatePost(false)}
      >
        <SafeAreaView
          style={[
            styles.container,
            Platform.OS === "android" && styles.androidContainer,
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreatePost(false);
                setNewPostText("");
                setSelectedImage(null);
              }}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity
              onPress={handleAddPost}
              disabled={newPostText.trim() === "" && !selectedImage}
              style={[
                styles.postButton,
                newPostText.trim() === "" && !selectedImage
                  ? styles.disabledButton
                  : null,
              ]}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.userInfoContainer}>
              <Image
                source={
                  userProfileImage
                    ? { uri: userProfileImage }
                    : require("assets/images/default-user.png")
                }
                style={styles.userAvatar}
              />
              <View>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.jobTitle}>
                  {data?.userType === "client" ? "Client" : "Job Seeker"}
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.postInputFull}
              placeholder="Share a professional update, job opportunity, or ask for advice..."
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
              autoFocus
            />

            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.postOptions}>
            <Text style={styles.addToYourPost}>Add to your post</Text>
            <View style={styles.postOptionsButtons}>
              <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
                <MaterialIcons name="photo-library" size={24} color="#0077B5" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={commentModalVisible}
        onRequestClose={closeCommentModal}
      >
        <SafeAreaView
          style={[
            styles.container,
            Platform.OS === "android" && styles.androidContainer,
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeCommentModal}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedPost && (
            <>
              <View style={styles.originalPostReference}>
                <View style={styles.postHeader}>
                  <Image
                    source={
                      selectedPost.profileImage
                        ? {
                            uri: `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${selectedPost.profileImage}`,
                          }
                        : require("assets/images/default-user.png")
                    }
                    style={styles.smallAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.username}>{selectedPost.username}</Text>
                    <Text style={styles.time}>
                      {new Date(selectedPost.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={styles.originalPostContent} numberOfLines={2}>
                  {selectedPost.postContent}
                </Text>
              </View>

              <ScrollView style={styles.commentsScrollView}>
                {selectedPost && (
                  <>
                    {commentsLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#0077B5" />
                      </View>
                    ) : commentsError ? (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                          Failed to load comments
                        </Text>
                      </View>
                    ) : !comments || comments.length === 0 ? (
                      <View style={styles.noCommentsContainer}>
                        <Text style={styles.noCommentsText}>
                          No comments yet. Be the first to comment!
                        </Text>
                      </View>
                    ) : (
                      comments.map((comment: Comment) =>
                        renderComment(comment, false, selectedPost.id)
                      )
                    )}
                  </>
                )}
              </ScrollView>

              <View style={styles.commentInputSection}>
                {replyingToUsername && (
                  <View style={styles.replyingToContainer}>
                    <Text style={styles.replyingToText}>
                      Replying to{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {replyingToUsername}
                      </Text>
                    </Text>
                    <TouchableOpacity onPress={cancelReply}>
                      <Ionicons name="close" size={18} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.addCommentContainer}>
                  <Image
                    source={
                      userProfileImage
                        ? { uri: userProfileImage }
                        : require("assets/images/default-user.png")
                    }
                    style={styles.commentAvatar}
                  />
                  <TextInput
                    style={styles.commentInput}
                    placeholder={
                      replyingToUsername
                        ? `Reply to ${replyingToUsername}...`
                        : "Write a comment..."
                    }
                    placeholderTextColor="#333"
                    value={newCommentText}
                    onChangeText={setNewCommentText}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleAddComment(selectedPost.id)}
                    disabled={newCommentText.trim() === ""}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={
                        newCommentText.trim() === "" ? "#B0C4DE" : "#0077B5"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Styles preserved with additions for Android top margin
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6f8",
  },
  androidContainer: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight || 25 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e9ee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0b216f",
  },
  createPostTrigger: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e9ee",
    marginBottom: 8,
  },
  createPostPlaceholder: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#e1e9ee",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  createPostText: {
    color: "#666",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#0077B5",
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: "#b0c4de",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  feedContainer: {
    paddingBottom: 15,
  },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 8,
    padding: 15,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  jobTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  time: {
    color: "#999",
    fontSize: 12,
  },
  content: {
    fontSize: 15,
    marginBottom: 15,
    lineHeight: 22,
    color: "#333",
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginVertical: 10,
  },
  stats: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e9ee",
  },
  statsText: {
    color: "#666",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  actionText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  activeActionText: {
    color: "#0077B5",
    fontWeight: "500",
  },
  commentSection: {
    borderTopWidth: 1,
    borderTopColor: "#e1e9ee",
    paddingTop: 15,
    marginTop: 5,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e1e9ee",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
    fontSize: 14,
  },
  sendButton: {
    padding: 8,
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  replyContainer: {
    marginLeft: 40,
    paddingLeft: 10,
    marginTop: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#e1e9ee",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 15,
    borderTopLeftRadius: 0,
  },
  commentUsername: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1c1e21",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#1c1e21",
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: "#65676B",
    marginRight: 12,
  },
  commentAction: {
    fontSize: 12,
    color: "#65676B",
    fontWeight: "600",
  },
  repliesContainer: {
    marginTop: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e9ee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0b216f",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  postInputFull: {
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 120,
    color: "#333",
  },
  selectedImageContainer: {
    marginTop: 15,
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
  },
  postOptions: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e9ee",
  },
  addToYourPost: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  postOptionsButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  optionButton: {
    padding: 10,
  },
  commentsScrollView: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  originalPostReference: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e9ee",
  },
  originalPostContent: {
    fontSize: 14,
    color: "#666",
    paddingLeft: 46,
  },
  commentInputSection: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e9ee",
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  replyingToContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f0f7ff",
    borderRadius: 15,
    marginBottom: 10,
  },
  replyingToText: {
    color: "#0077B5",
    fontSize: 13,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noCommentsText: {
    color: "#666",
  },
});

export default SocialFeedScreen;
