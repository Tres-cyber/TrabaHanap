import axios from "axios";
import decodeToken from "./token-decoder";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function fetchUserProfile() {
  const { data } = await decodeToken();
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    console.error("No token found in AsyncStorage for fetchUserProfile");
    throw new Error("Authentication token not found.");
  }

  const response = await axios.get(
    `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/user/profile/${data.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userType: data.userType,
      },
    }
  );

  return response.data;
}

export async function updateUserProfile(data) {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    console.error("No token found in AsyncStorage for updateUserProfile");
    throw new Error("Authentication token not found.");
  }

  const isFormData = data instanceof FormData;
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }

  const userId = isFormData ? data.get("id") : data.id;

  if (!userId) {
    console.error("User ID is missing in the data for updateUserProfile");
    throw new Error("User ID is required to update profile.");
  }

  const response = await axios.patch(
    `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/user/profile/edit/${userId}`,
    data,
    {
      headers: headers,
    }
  );
  return response.data;
}

export async function updateUserJobTags(data) {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    console.error("No token found in AsyncStorage for updateUserJobTags");
    throw new Error("Authentication token not found.");
  }

  const response = await axios.patch(
    `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/user/profile/edit/job-tags/${data.id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
