export default function ProductCard({ name, brand, price, paymentlistener }) {
  const goToPayemnt = () => {
    paymentlistener(true);
  };
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
        <p className=" flex justify-between items-center">
          <span className="text-gray-500 text-sm mr-1 flex-1"> {name} </span>
          <span className=" items-center flex-1">
            <div className="font-medium ml-1 text-center"> £{price}</div>
            <div className="w-full text-center">
              {/* U can add the detail page button HERE */}
              <button
                className=" w-16 bg-transparent border-[1px] border-black text-black hover:bg-black hover:text-white rounded-sm"
                onClick={goToPayemnt}
              >
                Buy
              </button>
            </div>
          </span>
        </p>
      </div>
    </div>
  );
}
