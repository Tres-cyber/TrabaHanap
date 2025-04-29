import axios from "axios";

let formData = new FormData();

export function SignUpData(params) {
  if ("profileImage" in params) {
    const fileName = params.profileImage.split("/").pop();

    formData.append("profileImage", {
      uri: params.profileImage,
      name: fileName,
      type: "image/jpeg",
    });
  } else {
    Object.keys(params).forEach((key) => {
      formData["_parts"].forEach((element) => {
        if (element.includes(key)) {
          formData.delete(key);
        }
      });

      formData.append(key, params[key]);
    });
  }
}

export const handleFormData = async () => {
  try {
    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/signup`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("Successful upload!", response.data);
  } catch (error) {
    console.error("Error Message", error.request);
  }
};

export const storeOTPRequest = async (email) => {
  try {
    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/store-otp`,
      { email },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("OTP store request successful:", response.data);
    return response.data; // Or return true/status code as needed
  } catch (error) {
    console.error("Error storing OTP:", error.response?.data || error.message);
    return false; // Indicate failure
  }
};

export const verifyOTPRequest = async (email, otp) => {
  try {
    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/verify-otp`,
      { email, otp },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.success === true;
  } catch (error) {
    return false;
  }
};

export const getSignUpUserType = () => {
  return formData.get("userType");
};

export const clearFormData = () => {
  formData = new FormData();
  console.log("Global FormData cleared.");
};
