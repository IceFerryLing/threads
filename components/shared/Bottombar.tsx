"use client";

import Image from "next/image";
import Link from "next/link";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";


function Bottombar() {
  const pathname = usePathname(); //这是一个hook，用于获取当前的路径名

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link)=>{
          const isActive = (pathname.includes(link.route) 
            && link.route.length > 1) || pathname === link.route;
          
          return (
            <Link 
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && 'bg-primary-500'}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          )}
        )}
      </div>
    </section>
  )
}

export default Bottombar;