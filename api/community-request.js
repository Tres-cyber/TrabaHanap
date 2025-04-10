import axios from "axios";
import decodeToken from "@/api/token-decoder";
import * as mime from "react-native-mime-types";

export async function AddCommunityPost(params) {
  const formData = new FormData();
  const { data } = await decodeToken();

  if (data.userType === "client") {
    formData.append("client", data.id);
  } else if (data.userType === "job-seeker") {
    formData.append("job-seeker", data.id);
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

  console.log("formData", formData);

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
    console.error("Error message:", error.message);
    throw error;
  }
}

export async function fetchCommunityPosts() {
  const { data } = await axios.get(
    `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/posts`
  );

  const extractIds = data.map((post) => ({
    userId: post.clientId || post.jobSeekerId,
  }));

  const { data: usernames } = await axios.get(
    `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/community/getUsername`,
    {
      params: {
        ids: extractIds,
      },
    }
  );

  const postsWithUsernames = data.map((post, index) => ({
    ...post,
    username: usernames[index],
  }));

  return postsWithUsernames;
}
