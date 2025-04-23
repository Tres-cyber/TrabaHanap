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

export const getSignUpUserType = () => {
  return formData.get("userType");
};

export const clearFormData = () => {
  formData = new FormData();
  console.log("Global FormData cleared.");
};
