import axios from "axios";

const API_URL = "http://16.171.23.49:8080/api/chat"; // 🔥 replace with your EC2 IP

export const sendMessage = async (message) => {
  const response = await axios.post(API_URL, {
    message: message,
    sessionId: "user1" // 🔥 required
  });

  return response.data;
};