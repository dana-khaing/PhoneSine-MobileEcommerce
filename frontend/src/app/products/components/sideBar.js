import { PriceRange } from "./priceRange";

const brandList = [
  { id: 1, brand: "All Products" },
  { id: 2, brand: "Apple" },
  { id: 3, brand: "Samsung" },
  { id: 4, brand: "OnePlus" },
  { id: 5, brand: "Google Pixel" },
];
const SideBar = ({
  selectedbranch,
  onBrandClick,
  Searchlistener,
  priceValue,
  priceListener,
  MIN,
  MAX,
  categories,
  selectedCategory,
  onCategoryClick,
}) => {
  return (
    <div className="px-0 py-0">
      <div className="font-bold mb-">Search</div>
      <div className="flex justify-center ">
        <input
          className=" border border-gray-300 rounded-3xl my-3 px-5 py-0 w-full text-base shadow-sm"
          type="text"
          placeholder="Search"
          onChange={Searchlistener}
        />
      </div>
      <div className="font-bold m-2">Brand List</div>
      <div className=" w-full text-start items-start justify-start">
        <ul>
          {brandList.map((item) => (
            <li key={item.id} className="list-none">
              <button
                onClick={() => onBrandClick(item.brand)}
                className={` m-1 py-2 px-5  overflow-hidden text-ellipsis whitespace-nowrap w-full rounded-lg text-start ${
                  item.brand === selectedbranch
                    ? "text-white bg-slate-900"
                    : "text-black"
                }`}
              >
                {item.brand}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="font-bold m-2">Category</div>
      <div className="w-full text-start items-start justify-start">
        <ul>
          <li><button onClick={() => onCategoryClick("")} className={`m-1 w-full rounded-lg px-5 py-2 text-start ${selectedCategory === "" ? "bg-slate-900 text-white" : "text-black"}`}>All categories</button></li>
          {categories.map((item) => (
            <li key={item.id}>
              <button onClick={() => onCategoryClick(String(item.id))} className={`m-1 w-full rounded-lg px-5 py-2 text-start ${String(item.id) === selectedCategory ? "bg-slate-900 text-white" : "text-black"}`}>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="m-3">
        <PriceRange
          priceListener={priceListener}
          priceValue={priceValue}
          MIN={MIN}
          MAX={MAX}
        />
      </div>
    </div>
  );
};

export default SideBar;
