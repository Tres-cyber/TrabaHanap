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
  } else if ("frontImage" in params || "backImage" in params) {
    if (params.idType) {
      formData.append("idType", params.idType);
    }

    if (params.frontImage) {
      const frontFileName = params.frontImage.split("/").pop();
      formData.append("idValidationFrontImage", {
        uri: params.frontImage,
        name: frontFileName,
        type: "image/jpeg",
      });
    }

    if (params.backImage) {
      const backFileName = params.backImage.split("/").pop();
      formData.append("idValidationBackImage", {
        uri: params.backImage,
        name: backFileName,
        type: "image/jpeg",
      });
    }
  } else {
    Object.keys(params).forEach((key) => {
      formData["_parts"].forEach((element) => {
        if (element.includes(key)) {
          formData.delete(key);
        }
      });

      const value =
        typeof params[key] === "string" ? params[key].trim() : params[key];

      formData.append(key, value);
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error("Error storing OTP:", error.response?.data || error.message);
    return false;
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
};
