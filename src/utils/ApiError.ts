import axios from "axios";
import axiosRetry from "axios-retry";

// একটি কাস্টম axios ইনস্ট্যান্স তৈরি করা হচ্ছে
const axiosInstance = axios.create({
  timeout: 8000, // ৮ সেকেন্ডের টাইমআউট (Vercel ফ্রি প্ল্যানে ১০ সেকেন্ড লিমিট)
  headers: {
    // DSE-কে রিয়েল ব্রাউজার হিসেবে চিনানোর জন্য হেডার যুক্ত করা হয়েছে
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
  }
});

// রিকোয়েস্ট ফেইল হলে ৩ বার পর্যন্ত রিট্রাই করার কনফিগারেশন
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

export default axiosInstance;
