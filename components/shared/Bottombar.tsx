"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

import { sidebarLinks } from "@/constants";

function Bottombar() {
  const pathname = usePathname();
  const clerk = useClerk();
  const userId = clerk.user?.id;

  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
        {sidebarLinks.map((link) => {
          const href = link.route === '/profile' && userId ? `/profile/${userId}` : link.route;
          const isActive =
            (pathname.includes(href) && href.length > 1) ||
            pathname === href;

          return (
            <Link
              href={href}
              key={link.label}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={16}
                height={16}
                className='object-contain'
              />

              <p className='text-subtle-medium text-light-1 max-sm:hidden'>
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;
