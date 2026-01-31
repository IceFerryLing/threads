// 这个库用于连接到 MongoDB 数据库

import mongoose from "mongoose";

let isConnected = false; // 检查是否已连接到数据库

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) return console.log("MONGODB_URI not found");
  if (isConnected) return console.log("MONGODB is already connected");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MONGODB connected");
  }catch(error){
    console.log("MONGODB connection error:", error);
  }
}




// mongodb+srv://iceferryling:OA3sCSXh2LqrPCyv@cluster0.yfdbjdj.mongodb.net/?appName=Cluster0