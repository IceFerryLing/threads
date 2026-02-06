"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

/**
 * 获取帖子（顶级线程）的函数，支持分页
 * @param pageNumber 默认值为1，表示第一页
 * @param pageSize 默认值为20，表示每页显示20个帖子
 * @returns 
 */
export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  await connectToDB();
  
  // 计算跳过的文档数量以实现分页
  const skipAmount = (pageNumber - 1) * pageSize;
  
  // 创建一个查询以获取没有父线程的帖子（顶级线程）（不是评论/回复的线程）。
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
//      model: Community,
    })
    .populate({
      path: "children", 
      populate: {
        path: "author", 
        model: User,
        select: "_id name parentId image", 
      },
    });

  // 执行查询并获取帖子数据
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); 
  // 计算是否有下一页
  const posts = await postsQuery.exec();
  // isNext为布尔值，指示是否有更多帖子可供分页
  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

// Params是createThread函数的参数类型定义
interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

/**
 * 创建一个新的帖子
 * @param param0 
 */
export async function createThread({ text, author, communityId, path }: Params) {
  try {
    await connectToDB();

    // // findOne用于获取社区的ObjectId
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    // 创建新的线程文档
    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject?._id, 
    });

    // 更新用户模型
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // 更新社区模型
      await Community.findByIdAndUpdate(communityIdObject._id, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

/**
 * 递归获取所有子线程及其后代
 * @param threadId 
 * @returns 
 */
async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  await connectToDB();
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

/**
 * 删除一个帖子及其所有子线程
 * @param id 
 * @param path 
 */
export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    await connectToDB();

    // 查找要删除的主线程
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // 递归获取所有子线程及其后代
    const descendantThreads = await fetchAllChildThreads(id);

    // 获取所有后代线程ID，包括主线程ID和子线程ID
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // 提取作者ID和社区ID，以分别更新用户和社区模型
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // 删除线程
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // 更新用户模型
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

/**
 * 通过ID获取线程及其相关信息
 * @param threadId 
 * @returns 
 */
export async function fetchThreadById(threadId: string) {
  await connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) 
      .populate({
        path: "community",
        // model: Community,
        select: "_id id name image",
      }) 
      .populate({
        path: "children", // 推送children字段
        populate: [
          {
            path: "author", // 推送children字段内的author字段
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // 推送children字段内的children字段
            model: Thread, // 指定模型为Thread
            populate: {
              path: "author", // 推送nested children内的author字段
              model: User,
              select: "_id id name parentId image", // 仅选择作者的_id和用户名字段
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

/**
 * 追加评论到线程
 * @param threadId 
 * @param commentText 
 * @param userId 
 * @param path 
 */
export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  await connectToDB();

  try {
    // 找到原始线程，以确保它存在
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // 创建新的评论线程
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // 设置parentId为原始线程的ID
    });

    // 将评论线程保存到数据库
    const savedCommentThread = await commentThread.save();

    // 将评论线程的ID添加到原始线程的children数组中
    originalThread.children.push(savedCommentThread._id);

    // 将更新后的原始线程保存到数据库
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
