// 这个文件是一个服务器操作，负责执行用户操作
// action是服务器端的操作，用于处理用户操作
"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import { ca } from "zod/v4/locales";
import { Params } from "zod/v4/core";
import path from "path";

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path
}: {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
} ): Promise<void> {
  // 连接到数据库
  await connectToDB();
  
  try{
    // 查找并更新用户信息
    await User.findOneAndUpdate(
      {id: userId}, 
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      // 如果指定值存在则更新文档，否则插入新文档
      {upsert: true}
    );

    // 重新验证指定路径以更新缓存
    if (path === '/profile/edit'){
      revalidatePath(path);
    }
  }catch(error: any){
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try{
    await connectToDB();

    return await User
    .findOne({id: userId})
  }catch (error : any){
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}