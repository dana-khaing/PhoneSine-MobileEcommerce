export default function Payment({ backToProduct, productdetail }) {
  return (
    <div className="w-full p-5">
      <div>
        <span
          className="flex-shrink-0 w-[33%] text-end underline hover:text-gray-500 cursor-pointer"
          onClick={() => backToProduct(false)}
        >
          {console.log(productdetail)}
          &lt; Back
        </span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
