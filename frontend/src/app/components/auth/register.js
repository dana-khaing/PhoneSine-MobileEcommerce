import { Inter } from "next/font/google";
import clsx from "clsx";
import { X } from "lucide-react";
import ActionBtn from "./actionBtn";

const inter = Inter({ subsets: ["latin"] });

const Register = ({ closeallcard, handlelogin }) => {
  return (
    <form className="fixed inset-0 flex items-center justify-center z-10 bg-gray-800 bg-opacity-40 backdrop-blur-md">
      <div
        className={clsx(
          "flex flex-col w-[25%] mx-auto h-max gap-2 rounded-2xl py-5 px-7 shadow-2xl bg-white",
          inter.className
        )}
      >
        <div className="flex">
          <h3 className="flex-1 mb-2 text-3xl text-neutral-900">SIGN UP</h3>
          <button onClick={closeallcard}>
            <X />
          </button>
        </div>
        <div className="flex justify-around">
          <div className="pr-2 w-[50%]">
            <div className="pb-1">
              <label className="font-normal text-sm">First name :</label>
            </div>
            <input
              type="name"
              className="border-[1px] p-3 h-11 w-[100%] rounded-lg border-black"
            />
          </div>
          <div className="pl-2 w-[50%]">
            <div className="pb-1">
              <label className="font-normal text-sm">Last name :</label>
            </div>
            <input
              type="name"
              className="border-[1px] p-3 h-11 w-[100%] rounded-lg border-black"
            />
          </div>
        </div>
        <label className="font-normal text-sm" htmlFor="emailInput">
          Email Address :
        </label>
        <input
          type="email"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
        />
        <label className="font-normal text-sm" htmlFor="passwordInput">
          Password :
        </label>
        <input
          type="password"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
        />
        <label className="font-normal text-sm" htmlFor="confirmPasswordInput">
          Confirm Password :
        </label>
        <input
          type="password"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
        />
        <button className="bg-neutral-900 text-white py-3 rounded-lg mt-3">
          Sign Up
        </button>
        <p className="mx-auto my-1 text-xs">OR</p>
        <ActionBtn icon="google.svg" text="Google" />
        <ActionBtn icon="apple.svg" text="Apple" />
        <div className="mx-auto my-2 text-sm text-black">
          <span>Already have an account? </span>
          <button className="underline font-medium" onClick={handlelogin}>
            Sign in
          </button>
        </div>
      </div>
    </form>
  );
};

export default Register;
