import { PriceRange } from "./priceRange";
const branchList = [
  { id: 1, branch: "Apple" },
  { id: 2, branch: "Samsaung" },
  { id: 3, branch: "One Plus" },
  { is: 4, branch: "Google Pixel" },
];
const categoryList = [
  { id: 1, list: "Earphone" },
  { id: 2, list: "Phone Case" },
];
const SideBar = () => {
  return (
    <div>
      <div className="font-bold">Branch List</div>
      <div className="flex justify-center space-x-14">
        <ul>
          {branchList.map((item) => (
            <li id={item.id} className="m-3">
              {item.branch}
            </li>
          ))}
        </ul>
      </div>
      <div className="font-bold">Category</div>
      <div>
        <ul>
          {categoryList.map((item) => (
            <li id={item.id} className="m-3">
              {item.list}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <PriceRange></PriceRange>
      </div>
    </div>
  );
};

export default SideBar;
