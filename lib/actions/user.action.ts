"use server";

import { SortOrder, QueryFilter } from "mongoose";
import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // 查找给定userId用户创建的所有帖子
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // 从"Community"模型中选择"name"和"_id"字段
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // 从"User"模型中选择"name"和"_id"字段
          },
        },
      ],
    });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

// 几乎与Thead（搜索+分页）和Community（搜索+分页）相似
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // 根据页码和每页大小计算需要跳过的用户数量
    const skipAmount = (pageNumber - 1) * pageSize;

    // 为提供的搜索字符串创建不区分大小写的正则表达式
    const regex = new RegExp(searchString, "i");

    // 创建初始查询对象来过滤用户
    const query: QueryFilter<typeof User> = {
      id: { $ne: userId }, // 从结果中排除当前用户
    };

    // 如果搜索字符串不为空，添加$or操作符以匹配用户名或名称字段
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // 根据createdAt字段和提供的排序顺序定义获取用户的排序选项
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // 计算匹配搜索条件的用户总数（不分页）
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // 检查当前页面之后是否有更多用户
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // 查找用户创建的所有帖子
    const userThreads = await Thread.find({ author: userId });

    // 从每个用户帖子的'children'字段中收集所有子帖子ID（回复）
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // 查找并返回子帖子（回复），排除同一用户创建的回复
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // 排除同一用户创建的帖子
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}
