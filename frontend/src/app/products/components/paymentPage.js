export default function Payment({ backToProduct }) {
  return (
    <div className="w-full p-5">
      <div>
        <span
          className="flex-shrink-0 w-[33%] text-end underline hover:text-gray-500 cursor-pointer"
          onClick={() => backToProduct(false)}
        >
          &lt; Back
        </span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
