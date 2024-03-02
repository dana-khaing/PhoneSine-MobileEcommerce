import React from "react";
import Slider from "react-slider";
import { useState } from "react";
const MIN = 100;
const MAX = 2000;

export const PriceRange = () => {
  const [values, setValues] = useState([MIN, MAX]);
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
        onChange={setValues}
        value={values}
        min={MIN}
        max={MAX}
        renderThumb={(props, state) => (
          <div {...props} style={{ ...props.style, ...thumbStyle }} />
        )}
      />
      <div className="flex justify-around">
        <span>${values[0]}</span>
        <span>${values[1]}</span>
      </div>
    </div>
  );
};
