// Navigation Item List
const Items = [
  { label: "Home", link: "/" },
  { label: "About Us", link: "/about-us" },
  { label: "Products", link: "/products" },
  { label: "Contact Us", link: "/" },
];

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center px-[3vw] py-2 shadow-md">
      <h1 className="text-2xl font-bold pr-2 ">Phone Sine</h1>
      {/* Used map function and
       loop NavItems */}
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
      <div className="flex items-center">
        <input
          className="border border-gray-300 rounded-3xl px-3 py-0 w-28 text-base"
          type="text"
          placeholder="Search"
        />

        <button className="pl-1 pr-1.5">
          <svg
            class="w-6 h-6  text-neutral-600 hover:text-black"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
              d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>
        </button>

        <button className="p-1.5">
          <svg
            class="w-7 h-7  text-neutral-600 hover:text-black"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.3L19 7H7.3"
            />
          </svg>
        </button>

        <button className="p-1.5">
          <svg
            class="w-7 h-7   text-neutral-600 hover:text-black"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a9 9 0 0 0 5-1.5 4 4 0 0 0-4-3.5h-2a4 4 0 0 0-4 3.5 9 9 0 0 0 5 1.5Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
