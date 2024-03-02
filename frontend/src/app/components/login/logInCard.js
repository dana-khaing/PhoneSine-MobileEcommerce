import { Inter } from "next/font/google";
import clsx from "clsx";
import Image from "next/image";
import { CircleUserRound, X } from "lucide-react";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Login() {
  const [isClicked, setIsClicked] = useState(false);

  const opencard = () => {
    setIsClicked(true);
  };

  const closecard = () => {
    setIsClicked(false);
  };
  return (
    <div>
      <button onClick={opencard} className="p-1.5">
        <CircleUserRound className="w-5 h-5  text-neutral-600 hover:text-black" />
      </button>
      {isClicked && (
        <div className="fixed inset-0 flex items-center justify-center z-10  bg-gray-800 bg-opacity-40 backdrop-blur-md">
          {/* U can use form if u want ... 
          But I gonna change it to 'div' 
          for shawcasing the 'X' buttom work */}
          <div
            className={clsx(
              "flex flex-col w-[25%] mx-auto h-max gap-2 rounded-2xl py-5 px-7 shadow-2xl bg-white",
              inter.className
            )}
          >
            <div className="flex">
              <h3 className=" flex-1 mb-2 text-3xl text-neutral-900">
                SIGN IN
              </h3>
              <button onClick={closecard}>
                <X />
              </button>
            </div>

            <label className="font-normal text-sm">Email Address :</label>
            <input
              type="email"
              className="border-[1px] p-3 h-11 rounded-lg border-black"
            />
            <label className="font-normal text-sm">Password :</label>
            <input
              type="password"
              className="border-[1px] p-3 h-11 rounded-lg border-black"
            />
            <div className="flex items-center py-2 text-sm">
              <input type="checkbox" className="h-4 w-4 border-2" />
              <p className="mr-auto ml-2">Remember me</p>
              <a className="underline" href="/login">
                Forgot your password?
              </a>
            </div>
            <button className=" bg-neutral-900 text-white py-3 rounded-lg">
              Sign In
            </button>
            <p className="mx-auto my-1 text-xs">OR</p>
            <ActionBtn icon="google.svg" text="Google" />
            <ActionBtn icon="apple.svg" text="Apple" />
            <div className="mx-auto my-2 text-sm text-black">
              <span>Don't have account yet? </span>
              <span>
                <a className="underline font-medium" href="/login">
                  Sign Up
                </a>{" "}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ActionBtn = ({ text, icon }) => {
  return (
    <button className="border-[1px] py-2.5 rounded-lg mb-3 flex items-center border-black">
      <div className="flex-1">
        <Image
          src={icon}
          alt="Google"
          width={25}
          height={25}
          className="mx-3"
        />
      </div>
      <span className="mx-auto"> Continue with {text}</span>
      <div className="flex-1" />
    </button>
  );
};
