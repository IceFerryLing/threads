// app/api/uploadthing/core.ts

import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const getUser = async () => await currentUser();

export const ourFileRouter = {
  // 定义尽可能多的 FileRoutes，每个都有一个唯一的 routeSlug
  media: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // 设置此 FileRoute 的权限和文件类型
    .middleware(async (req) => {
      // 此代码在上传前在服务器上运行
      const user = await getUser();

      // 如果你抛出异常，用户将无法上传
      if (!user) throw new Error("Unauthorized");

      // 无论返回什么，都可以在 onUploadComplete 中作为 `metadata` 访问
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // 此代码在上传后在服务器上运行
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
