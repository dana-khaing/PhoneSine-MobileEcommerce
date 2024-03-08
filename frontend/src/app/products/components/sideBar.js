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
const SideBar = ({ onBrandClick, Searchlistener }) => {
  return (
    <div className="px-0 py-0">
      <div className="flex justify-center items-center">
        <input
          className=" border border-gray-300 rounded-3xl my-3 px-5 py-0 w-[10.5rem] text-base shadow-sm"
          type="text"
          placeholder="Search"
          onChange={Searchlistener}
        />
      </div>
      <div className="font-bold mb-2">Brand List</div>
      <div className="px-3">
        {brandList.map((item) => (
          <ul key={item.id}>
            <button className="m-3" onClick={() => onBrandClick(item.brand)}>
              {item.brand}
            </button>
          </ul>
        ))}
      </div>
      <div className="font-bold mb-2">Category</div>
      <div className="px-3">
        {categoryList.map((item) => (
          <ul key={item.id}>
            <button className="m-3">{item.list}</button>
          </ul>
        ))}
      </div>
      <div>
        <PriceRange></PriceRange>
      </div>
    </div>
  );
};

export default SideBar;
