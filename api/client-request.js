import axios from "axios";

export async function AddJobRequest(params) {
  const formData = new FormData();

  function parseMultipleImages(images) {
    images.forEach((img) =>
      formData.append("jobImage", {
        uri: img,
        name: img.split("/").pop(),
        type: "image/jpeg",
      }),
    );
  }

  if (params.client) {
    formData.append("client", params.client.id);
  }

  if (params.jobImage.length != 0) {
    parseMultipleImages(params.jobImage);
  }

  Object.keys(params).forEach((key) => {
    if (key !== "jobImage" && key !== "client") {
      formData.append(key, params[key]);
    }
  });
  console.log(formData);
  try {
    const jobPost = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/client-home/add-jobs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    console.log("Successful Job Post", jobPost.data);
  } catch (e) {
    console.log(e);
  }
}
