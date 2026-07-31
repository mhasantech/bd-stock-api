import axios from "axios";
import axiosRetry from "axios-retry";
import https from "https";

const axiosInstance = axios.create({
  timeout: 15000, // টাইমআউট ১৫ সেকেন্ডে বৃদ্ধি করা হয়েছে
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
  },
  // 🔥 DSE এর SSL সার্টিফিকেট এড়িয়ে যাওয়ার জন্য এটি অত্যন্ত জরুরি
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

export default axiosInstance;
