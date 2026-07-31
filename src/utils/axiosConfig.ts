import axios from "axios";
import axiosRetry from "axios-retry";
import https from "https"; // <-- https মডিউল ইমপোর্ট করা হয়েছে

const axiosInstance = axios.create({
  timeout: 10000, // টাইমআউট ১০ সেকেন্ডে বাড়ানো হয়েছে
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
  },
  // 🛡️ DSE-এর SSL সার্টিফিকেট ভেরিফাই না করার জন্য এই অপশনটি যুক্ত করা হয়েছে
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

export default axiosInstance;
