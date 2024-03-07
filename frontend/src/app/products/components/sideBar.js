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
const SideBar = ({ onBrandClick }) => {
  return (
    <div>
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
