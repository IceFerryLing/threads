import mongoose from "mongoose";

// Schema函数定义了Thread模型的结构
const threadSchema = new mongoose.Schema({
  // 主要内容
  text: {
    type: String,
    required: true,
  },
  // 作者引用
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // 所属社区引用
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // 父线程引用（如果有的话）
  parentId: {
    type: String,
  },
  // 子线程引用数组
  children: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Thread",
    },
  ],
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
