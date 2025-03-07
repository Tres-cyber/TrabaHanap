import axios from "axios";

const formData = {};

export function SignUpData(params) {
  Object.assign(formData, params);
  console.log("Last Updated Data", formData);
}

export const handleFormData = async () => {
  console.log("Inside Handle Form Function", formData);
  // try {
  //   const res = await axios.get("http://192.168.100.190:3000");

  //   console.log(res.data);
  // } catch (error) {
  //   console.error(error);
  // }

  try {
    const response = await axios.post(
      "http://192.168.100.190:3000/signup",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    console.log(response.data);
  } catch (error) {
    // console.log(typeof formData.firstName);
    console.log("Error Message", error);
  }
};
