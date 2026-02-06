import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  
  if (user) {
    // 如果用户已登录，重定向到用户自己的个人资料页面
    redirect(`/profile/${user.id}`);
  } else {
    // 如果用户未登录，重定向到登录页面
    redirect("/sign-in");
  }
}

export default Page;