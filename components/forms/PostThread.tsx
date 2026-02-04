"use client";

// z是Zod库的命名空间，用于数据验证和模式定义
import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod"; // 用于将Zod验证集成到React Hook Form中

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThreadValidation } from "@/lib/validations/thread";
// import { UserValidation } from "@/lib/validations/user";
// import { updateUser } from "@/lib/actions/user.action";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}


function PostThread( {userId}: {userId: string} ) {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      accoutId: userId,
    },
  });

  const onSubmit = () => {
    // await createThread();
  }




  return (
    <Form {...form}>
      <form 
      onSubmit={form.handleSubmit(onSubmit)} // 提交表单时调用form.handleSubmit方法
      className="flex flex-col justify-start gap-10"
      >
        <FormField 
          control={form.control}
          name='thread'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                content
              </FormLabel>
              <FormControl className="mt-10 no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={15}
                  {...field}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          Post Thread
        </Button>
      </form>
    </Form>
  )
}

export default PostThread;