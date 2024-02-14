import React from "react";
const Items = [
  { label: "Home", link: "/" },
  { label: "About Us", link: "/about-us" },
  { label: "Products", link: "/products" },
  { label: "Contact Us", link: "/" },
];

export const NavList = () => {
  return (
    <div className="flex justify-center space-x-14">
      {Items.map((item, index) => (
        <a
          key={index}
          href={item.link}
          className="font-semibold text-neutral-600 hover:text-black"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
};
