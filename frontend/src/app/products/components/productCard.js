export default function ProductCard({
  product,
  name,
  brand,
  price,
  description,
  availableStock,
  paymentlistener,
  productdetail,
}) {
  const goToPayemnt = () => {
    paymentlistener(true);
    productdetail(product);
  };
  return (
    <div className="px-4 pb-9 sm:px-8">
      <div className="py-12 bg-gray-100 flex justify-center">
        <img
          src="/iph15-pro.jpeg"
          alt="iPhone 15 Pro"
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
              <a href={`/products/${product.id}`} className="mr-2 inline-block underline">Details</a>
              <button
                disabled={availableStock === 0}
                className=" w-16 bg-transparent border-[1px] border-black text-black hover:bg-black hover:text-white rounded-sm disabled:cursor-not-allowed disabled:opacity-40"
                onClick={goToPayemnt}
              >
                {availableStock === 0 ? "Sold" : "Buy"}
              </button>
            </div>
          </span>
        </p>
      </div>
    </div>
  );
}
