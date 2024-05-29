export default function ProductCard({ name, brand, price }) {
  return (
    <div className="px-12 pb-9">
      <div className="py-12 bg-gray-100 flex justify-center">
        <img
          src="/iph15-pro.jpeg"
          alt="Product Image"
          className="w-36 h-auto"
        />
      </div>
      <div className="p-2">
        <p className="font-semibold">{brand}</p>
        <p className="flex justify-between items-center">
          <span className="text-gray-500 text-sm mr-1"> {name} </span>
          <span className="font-medium ml-1"> £{price}</span>
        </p>
      </div>
    </div>
  );
}
