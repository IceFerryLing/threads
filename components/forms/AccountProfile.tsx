"use client";

// z是Zod库的命名空间，用于数据验证和模式定义
import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isBase64Image } from "@/lib/utils";

import { UserValidation } from "@/lib/validations/user";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.action";

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

  const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { startUpload } = useUploadThing("media");

  // React中的useState钩子，用于管理组件状态
  // files状态用于存储用户上传的文件列表,类型为File[]数组
  // setfiles是更新files状态的函数
  const [files, setFiles] = useState<File[]>([]); // 用于存储上传的文件

  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image ? user.image : "",
      name: user?.name ? user.name : "",
      username: user?.username ? user.username : "",
      bio: user?.bio ? user.bio : "",
    },
  });

  // 表单提交处理函数
  // values参数是表单中用户填写的数据，类型为UserValidation定义的类型
  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;

    const hasImageChanged = isBase64Image(blob);
    // 上传图片到服务器
    if (hasImageChanged) {
      const imgRes = await startUpload(files);
      if (imgRes && imgRes[0].ufsUrl) {
        values.profile_photo = imgRes[0].ufsUrl;
      }
    }

    // 对象解构赋值，调用updateUser服务器操作更新用户信息
    await updateUser({
      userId: user.id,
      username: values.username,
      name: values.name,
      bio: values.bio,
      image: values.profile_photo,
      path: pathname,
      // user.id,
      // values.username,
      // values.name,
      // pathname,
      // values.bio,
      // values.profile_photo,
    });

    if (pathname === "/profile/edit") {
      router.back();
    } else {
      router.push("/");
    }
  };

  // event是文件输入变化事件，fieldChange是一个回调函数，用于更新表单字段的值
  const handleImage = (event: ChangeEvent<HTMLInputElement>, 
    fieldChange: (value: string) => void) => {
  
    event.preventDefault(); // 阻止默认的表单提交行为
    const fileReader = new FileReader(); // 创建一个新的FileReader对象，用于读取文件内容

    // 检查文件输入是否有文件被选中
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFiles(Array.from(event.target.files));

      // include方法用于检查文件类型是否包含“image”字符串，以确保上传的是图片文件
      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        className='flex flex-col justify-start gap-10'
//        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField // 头像上传
          control={form.control}
          name='profile_photo'
          render={({ field }) => (
            <FormItem className='flex items-center gap-4'>
              <FormLabel className='account-form_image-label'>
                {field.value ? (
                  <Image
                    src={field.value}
                    alt='profile_icon'
                    width={96}
                    height={96}
                    priority
                    className='rounded-full object-contain'
                  />
                ) : (
                  <Image // 默认头像
                    src='/assets/profile.svg'
                    alt='profile_icon'
                    width={24}
                    height={24}
                    className='object-contain'
                  />
                )}
              </FormLabel>
              <FormControl className='flex-1 text-base-semibold text-gray-200'>
                <Input
                  type='file'
                  accept='image/*'
                  placeholder='Add profile photo'
                  className='account-form_image-input'
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />

          
        <FormField // 名字
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input no-focus'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField // 用户名
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Username
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='account-form_input no-focus'
                  {...field}  // field是react-hook-form提供的，用于绑定表单输入和状态管理
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField // 个人简介
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className='account-form_input no-focus'
                  {...field}  // field是react-hook-form提供的，用于绑定表单输入和状态管理
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-primary-500'>
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default AccountProfile;
