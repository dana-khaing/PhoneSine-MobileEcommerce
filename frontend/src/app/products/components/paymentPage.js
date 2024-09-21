export default function Payment({ backToProduct, productdetail }) {
  return (
    <div className="w-full p-5 flex-row">
      <div className="m-3">
        <span className="w-[33%] shrink-0">
          <button
            className="flex-shrink-0 w-[33%] text-start underline hover:text-gray-500 cursor-pointer"
            onClick={() => backToProduct(false)}
          >
            &lt; Back
          </button>
        </span>
        <span className="w-[33%] shrink-0 text-xl"></span>
        <span className="w-[33%] shrink-0"></span>
      </div>
      <div className="flex justify-around items-center w-full h-screen">
        <div className="p-[0.8] w-[45%] h-[100%]">
          {/* {we can loop all the photo of product} */}
          <img src="/iph15-pro.jpeg" alt="iPhone 15 Pro" />
        </div>
        <div className="w-[55%] p-3 m-3 h-screen">
          <div className="text-start text-3xl font-bold my-2 h-[6%]">
            {productdetail.name}
          </div>
          <div className="text-start text-xl font-medium my-2 h-[6%]">
            Brand Company : {productdetail.brand}
          </div>
          <div className="h-[50%]">{productdetail.description}</div>
          <div className="text-end text-lg font-bold my-2 h-[6%]">
            Price : £{productdetail.price}
          </div>
          <div className="flex justify-around">
            <div className="w-[45%] text-lg font-bold my-2">
              <button className=" w-full h-12 bg-transparent border-[1px] border-black text-black hover:bg-black hover:text-white rounded-sm">
                Buy
              </button>
            </div>
            <div className="w-[45%] text-lg font-bold my-2">
              <button className="w-full h-12 bg-transparent border-[1px] border-black text-black hover:bg-black hover:text-white rounded-sm">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
