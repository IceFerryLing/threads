// 保存用户的表单数据
import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().nonempty().min(1).max(5000),
  accoutId: z.string(),
})