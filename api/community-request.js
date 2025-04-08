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
  formData.append("postContent", params.content);
  formData.append("likeCount", 0);
  formData.append("commentCount", 0);

  if (params.image) {
    formData.append("postImage", {
      uri: params.image,
      name: params.image.split("/").pop(),
      type: mime.lookup(params.image),
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
    console.error("Error message:", error.message);
    throw error;
  }
}
