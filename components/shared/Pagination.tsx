// 这个文件是一个分页组件，用于在页面中显示分页导航。它接受当前页码、是否有下一页以及路径作为参数，并根据这些参数渲染分页按钮。当用户点击“Prev”或“Next”按钮时，组件会使用 Next.js 的路由功能导航到相应的页面。

"use client";

import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

interface Props {
  pageNumber: number;
  isNext: boolean;
  path: string;
}

function Pagination({ pageNumber, isNext, path }: Props) {
  const router = useRouter();

  const handleNavigation = (type: string) => {
    let nextPageNumber = pageNumber;

    if (type === "prev") {
      nextPageNumber = Math.max(1, pageNumber - 1);
    } else if (type === "next") {
      nextPageNumber = pageNumber + 1;
    }

    if (nextPageNumber > 1) {
      router.push(`/${path}?page=${nextPageNumber}`);
    } else {
      router.push(`/${path}`);
    }
  };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className='pagination'>
      <Button
        onClick={() => handleNavigation("prev")}
        disabled={pageNumber === 1}
        className='!text-small-regular text-light-2'
      >
        Prev
      </Button>
      <p className='text-small-semibold text-light-1'>{pageNumber}</p>
      <Button
        onClick={() => handleNavigation("next")}
        disabled={!isNext}
        className='!text-small-regular text-light-2'
      >
        Next
      </Button>
    </div>
  );
}

export default Pagination;
