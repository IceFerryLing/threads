import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { title } from "process";

import '../globals.css';
// 定义页面的元数据
export const metadata = {
    title: 'Threads',
    description: 'Threads App',
}

// 这里引入字体
const inter = Inter({ subsets: ['latin'] })
/**
 * 应用的根布局组件，提供全局的 HTML 结构、字体样式和 Clerk 鉴权上下文
 * @param {object} props - 组件接收的参数对象
 * @param {React.ReactNode} props.children - 路由匹配到的子页面内容，会被自动注入
 * @returns {JSX.Element} 包含完整 HTML 结构的 React 元素
 */
export default function RootLayout({ children }:{ children: React.ReactNode }){
    return (
    <ClerkProvider>
        <html lang="en">
            <body className={`${inter.className} bg-dark-1`}>
                {children}
            </body>
        </html>
    </ClerkProvider>)
}