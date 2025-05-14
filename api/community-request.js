import axios from "axios";
import decodeToken from "@/api/token-decoder";
import * as mime from "react-native-mime-types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function AddCommunityPost(params) {
  const formData = new FormData();
  const { data } = await decodeToken();

  if (data.userType === "client") {
    formData.append("client", data.id);
  } else if (data.userType === "job-seeker") {
    formData.append("jobSeeker", data.id);
  }

  formData.append("username", params.username);
  formData.append("postContent", params.postContent);
  formData.append("likeCount", params.likeCount);
  formData.append("commentCount", params.commentCount);

  if (params.postImage) {
    formData.append("postImage", {
      uri: params.postImage,
      name: params.postImage.split("/").pop(),
      type: mime.lookup(params.postImage),
    });
  }

  try {
    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/create-post`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("Successfully created community post!", response.data);
    return response.data;
  } catch (error) {
    // console.error("Error message:", error.message);
    // throw error;
  }
}

export async function fetchCommunityPosts() {
  try {
    const { data: postsData } = await axios.get(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts`,
      {
        timeout: 20000,
      }
    );

    if (!postsData || postsData.length === 0) {
      console.log("No posts found initially.");
      return [];
    }

    const extractIds = postsData.map((post) => ({
      userId: post.clientId || post.jobSeekerId,
    }));

    const { data: usernames } = await axios.get(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/getUsername`,
      {
        params: { ids: extractIds },
        timeout: 15000,
      }
    );

    const postsWithComments = await Promise.all(
      postsData.map(async (post) => {
        try {
          const { data: comments } = await axios.get(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${post.id}/getComments`,
            { timeout: 10000 }
          );
          return {
            ...post,
            commentCount: comments.length,
          };
        } catch (error) {
          console.error(
            "Error fetching comments for post:",
            post.id,
            error.code === "ECONNABORTED" ? "Timeout" : error
          );
          return {
            ...post,
            commentCount: 0,
          };
        }
      })
    );

    const postsWithUsernames = postsWithComments.map((post) => {
      const userId = post.clientId || post.jobSeekerId;
      const userDetails = usernames[userId];
      const fullName = userDetails
        ? `${userDetails.firstName} ${
            userDetails.middleName ? userDetails.middleName[0] + "." : ""
          } ${userDetails.lastName}`.trim()
        : "Unknown User";

      return {
        ...post,
        username: fullName,
        profileImage: userDetails?.profileImage || null,
      };
    });
    console.log("Successfully processed all community posts.");
    return postsWithUsernames;
  } catch (error) {
    // console.error(
    //   "Error in fetchCommunityPosts pipeline:",
    //   error.code === "ECONNABORTED" ? "Timeout" : error
    // );
    throw error;
  }
}

export async function likePost(postId) {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await decodeToken();

    const requestData = {
      postId: postId,
      userId: data.id,
      userType: data.userType,
    };

    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${postId}/hasLiked`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
}

export async function checkIfLiked(postId) {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await decodeToken();

    const response = await axios.get(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${postId}/checkIfLiked`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          userId: data.id,
          userType: data.userType,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error checking like status:", error);
    throw error;
  }
}

export async function unlikePost(postId) {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await decodeToken();

    const requestData = {
      postId: postId,
      userId: data.id,
      userType: data.userType,
    };

    const response = await axios.delete(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${postId}/unlike`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: requestData,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
}

export async function addComment(postId, comment) {
  try {
    const token = await AsyncStorage.getItem("token");
    const { data } = await decodeToken();

    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${postId}/addComment`,
      {
        comment: comment.comment,
        userId: data.id,
        userType: data.userType,
        postId: postId,
        parentCommentId: comment.parentCommentId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

function transformCommentData(comment) {
  const userData = comment.client || comment.jobSeeker?.user;

  const profileImage = userData?.profileImage;
  const firstName = userData?.firstName || "Unknown";
  const middleName = userData?.middleName || "";
  const lastName = userData?.lastName || "User";

  const formattedUsername = `${firstName} ${
    middleName ? middleName[0] + "." : ""
  } ${lastName}`.trim();

  const avatarUrl = profileImage
    ? `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/${profileImage}`
    : null;

  return {
    id: comment.id,
    username: formattedUsername,
    avatar: avatarUrl,
    text: comment.comment,
    time: new Date(comment.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    replies: (comment.replies || []).map(transformCommentData),
    isUpvoted: false,
  };
}

export async function fetchPostComments(postId) {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts/${postId}/getComments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const commentsMap = new Map();
    const topLevelCommentsData = [];

    response.data.forEach((comment) => {
      commentsMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    });

    response.data.forEach((comment) => {
      const commentWithReplies = commentsMap.get(comment.id);
      if (comment.parentCommentId) {
        const parentComment = commentsMap.get(comment.parentCommentId);
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        }
      } else {
        topLevelCommentsData.push(commentWithReplies);
      }
    });

    const transformedComments = topLevelCommentsData.map(transformCommentData);

    return transformedComments;
  } catch (error) {
    // console.error("Error fetching comments:", error);
    throw error;
  }
}
