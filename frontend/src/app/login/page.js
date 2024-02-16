import { Inter } from "next/font/google";
import clsx from "clsx";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

const LoginPage = () => {
  return (
    <form
      action=""
      className={clsx(
        "flex flex-col w-[25%] mx-auto h-full gap-2 rounded-2xl py-8 px-5 shadow-2xl",
        inter.className
      )}
    >
      <h3 className="mb-7 text-2xl text-red-400">SIGN IN</h3>
      <label className="font-normal">Email Address</label>
      <input type="email" className="border-2 p-3 rounded-lg" />
      <label>Password</label>
      <input type="password" className="border-2 p-3 rounded-lg" />
      <div className="flex items-center py-4 text-sm">
        <input type="checkbox" className="h-4 w-4 border-2" />
        <p className="mr-auto ml-3">Keep me signed in</p>
        <a className="underline">Forgot your password?</a>
      </div>
      <button className="bg-[#C36060] text-white py-3 rounded-lg">
        Sign In
      </button>
      <p className="mx-auto my-1">OR</p>
      <ActionBtn icon="google.svg" text="Google" />
      <ActionBtn icon="apple.svg" text="Apple" />
      <p className="mx-auto my-2 text-sm text-[#C36060]">
        Don't have account yet? Sign Up
      </p>
    </form>
  );
};

export default LoginPage;

const ActionBtn = ({ text, icon }) => {
  return (
    <button className="border-2 py-2.5 rounded-lg mb-3 flex items-center">
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
