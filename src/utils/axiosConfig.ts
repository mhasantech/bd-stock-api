import axios from "axios";
import axiosRetry from "axios-retry";
import https from "https";

const axiosInstance = axios.create({
  baseURL: "https://dsebd.org",
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
  },
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // 🔥 এই লাইনটি নিশ্চিত করুন
  })
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

export default axiosInstance;
