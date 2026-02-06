// 这个文件定义了 User 模型，表示用户的数据结构

import mongoose from "mongoose";
import { use } from "react";

const userSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, unique: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  image: String,
  bio: String,
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId, // 这是一个引用类型，引用的是 Thread 模型
      ref: 'Thread' // 引用的模型名称
    }
  ],

  onboarded: {
    type: Boolean,
    default: false
  },

  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    }
  ]
});

// 如果模型已经存在，则使用现有的模型，否则创建一个新的模型
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

