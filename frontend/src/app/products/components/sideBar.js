import { PriceRange } from "./priceRange";

const brandList = [
  { id: 1, brand: "All Products" },
  { id: 2, brand: "Apple" },
  { id: 3, brand: "Samsung" },
  { id: 4, brand: "One Plus" },
  { id: 5, brand: "Google Pixel" },
];
const categoryList = [
  { id: 1, list: "Earphone" },
  { id: 2, list: "Phone Case" },
];
const SideBar = ({
  onBrandClick,
  Searchlistener,
  priceValue,
  priceListener,
  MIN,
  MAX,
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
      <div className="px-x3 w-full text-start items-start justify-start">
        <ul>
          {brandList.map((item) => (
            <li key={item.id} className="list-none">
              <button
                className="m-3 overflow-hidden text-ellipsis whitespace-nowrap"
                onClick={() => onBrandClick(item.brand)}
              >
                {item.brand}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="font-bold m-2">Category</div>
      <div className="px-x3 w-full text-start items-start justify-start">
        <ul>
          {categoryList.map((item) => (
            <li key={item.id}>
              <button className="m-3 overflow-hidden text-ellipsis whitespace-nowrap">
                {item.list}
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
