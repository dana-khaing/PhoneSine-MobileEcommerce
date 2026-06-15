"use client";

import Link from "next/link";
import { useContext } from "react";
import { LocaleContext } from "../../contexts/localeContext";
const Items = [
  { label: "home", link: "/" },
  { label: "products", link: "/products" },
  { label: "about", link: "/about-us" },
];

export const NavList = () => {
  const { t } = useContext(LocaleContext);
  return (
    <div className="flex flex-wrap justify-center gap-5 md:gap-10">
      {Items.map((item, index) => (
        <Link
          key={index}
          href={item.link}
          className="font-semibold text-neutral-600 hover:text-black"
        >
          {t(item.label)}
        </Link>
      ))}
    </div>
  );
};
