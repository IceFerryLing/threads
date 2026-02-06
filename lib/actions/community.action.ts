"use server";

import { QueryFilter, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  try {
    connectToDB();

    // 根据提供的唯一ID查找用户
    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found"); // 处理找不到该ID用户的情况
    }

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id, // 使用用户的mongoose ID
    });

    const createdCommunity = await newCommunity.save();

    // Update User model
    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity;
  } catch (error) {
    // 处理任何错误
    console.error("创建社区错误:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error) {
    // 处理任何错误
    console.error("获取社区详情错误:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(id: string) {
  try {
    connectToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // 从"User"模型中选择"name"和"_id"字段
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // 从"User"模型中选择"name"和"_id"字段
          },
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    // 处理任何错误
    console.error("获取社区帖子错误:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // 根据页码和每页大小计算需要跳过的社区数量
    const skipAmount = (pageNumber - 1) * pageSize;

    // 为提供的搜索字符串创建不区分大小写的正则表达式
    const regex = new RegExp(searchString, "i");

    // 创建初始查询对象来过滤社区
    const query: QueryFilter<typeof Community> = {};

    // 如果搜索字符串不为空，添加$or操作符以匹配用户名或名称字段
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // 根据createdAt字段和提供的排序顺序定义获取社区的排序选项
    const sortOptions = { createdAt: sortBy };

    // 创建查询以根据搜索和排序条件获取社区
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // 计算匹配搜索条件的社区总数（不分页）
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // 检查当前页面之后是否有更多社区
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("获取社区错误:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB();

    // 根据唯一ID查找社区
    const community = await Community.findOne({ id: communityId });

    if (!community) {
      throw new Error("Community not found");
    }

    // 根据唯一ID查找用户
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    // 检查用户是否已经是社区成员
    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    // 将用户的_id添加到社区的members数组中
    community.members.push(user._id);
    await community.save();

    // 将社区的_id添加到用户的communities数组中
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    // 处理任何错误
    console.error("添加成员到社区错误:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    // 从社区的members数组中移除用户的_id
    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    // 从用户的communities数组中移除社区的_id
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    // 处理任何错误
    console.error("从社区移除用户错误:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    connectToDB();

    // 根据社区的_id查找并更新信息
    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    // 处理任何错误
    console.error("更新社区信息错误:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    connectToDB();

    // 根据社区ID查找并删除社区
    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // 删除与社区关联的所有帖子
    await Thread.deleteMany({ community: communityId });

    // 查找所有属于该社区的用户
    const communityUsers = await User.find({ communities: communityId });

    // 从每个用户的'communities'数组中移除社区
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("删除社区错误: ", error);
    throw error;
  }
}
