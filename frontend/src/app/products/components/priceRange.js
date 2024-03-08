import React from "react";
import Slider from "react-slider";

export const PriceRange = ({ priceValue, priceListener, MIN, MAX }) => {
  const thumbStyle = {
    width: "17px",
    height: "17px",
    backgroundColor: "#fff",
    border: "2px solid black",
    borderRadius: "50%",
    cursor: "pointer",
    top: "-7px",
  };
  return (
    <div>
      <div className="font-bold">PriceRange</div>
      <Slider
        className="w-full h-0.5 bg-slate-950 my-5"
        onChange={priceListener}
        value={priceValue}
        min={MIN}
        max={MAX}
        renderThumb={(props, state) => (
          <div {...props} style={{ ...props.style, ...thumbStyle }} />
        )}
      />
      <div className="flex">
        <span className="flex-1">${priceValue[0]}</span>
        <span>${priceValue[1]}</span>
      </div>
    </div>
  );
};
