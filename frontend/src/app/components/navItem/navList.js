import Link from "next/link";
const Items = [
  { label: "Home", link: "/" },
  { label: "Products", link: "/products" },
  { label: "About Us", link: "/about-us" },
  { label: "Contact Us", link: "/contact-us" },
];

export const NavList = () => {
  return (
    <div className="flex justify-center space-x-14">
      {Items.map((item, index) => (
        <Link
          key={index}
          href={item.link}
          className="font-semibold text-neutral-600 hover:text-black"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};
