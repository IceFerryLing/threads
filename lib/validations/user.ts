// 保存用户的表单数据
import * as z from "zod";

export const UserValidation = z.object({
  profile_photo: z.url().nonempty(),
  name: z.string().min(3).max(30),
  username: z.string().min(3).max(1000),
  bio: z.string().max(1000),
})