import { Inter } from "next/font/google";
import clsx from "clsx";
import { X } from "lucide-react";
import ActionBtn from "./actionBtn";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

const Login = ({ closeallcard, handlesignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (data.status === 200) {
      closeallcard();
      // Adapt the alert message to an appropriate message and interface
      // alert("Login success");
    } else {
      // Adapt the alert message to an appropriate message and interface
      alert("Login failed");
    }
  };
  return (
    <form
      onSubmit={handleLogin}
      className="fixed inset-0 flex items-center justify-center z-10 bg-gray-800 bg-opacity-40 backdrop-blur-md"
    >
      <div
        className={clsx(
          "flex flex-col w-[25%] mx-auto h-max gap-2 rounded-2xl py-5 px-7 shadow-2xl bg-white",
          inter.className
        )}
      >
        <div className="flex">
          <h3 className="flex-1 mb-2 text-3xl text-neutral-900">SIGN IN</h3>
          <button onClick={closeallcard}>
            <X />
          </button>
        </div>
        <label className="font-normal text-sm">Email Address :</label>
        <input
          type="email"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="font-normal text-sm">Password :</label>
        <input
          type="password"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center py-2 text-sm">
          <input type="checkbox" className="h-4 w-4 border-2" />
          <p className="mr-auto ml-2">Remember me</p>
          <a className="underline" href="/products">
            Forgot your password?
          </a>
        </div>
        <button
          type="submit"
          className="bg-neutral-900 text-white py-3 rounded-lg"
        >
          Sign In
        </button>
        <p className="mx-auto my-1 text-xs">OR</p>
        <ActionBtn icon="google.svg" text="Google" />
        <ActionBtn icon="apple.svg" text="Apple" />
        <div className="mx-auto my-2 text-sm text-black">
          <span>Don't have account yet? </span>
          <button className="underline font-medium" onClick={handlesignup}>
            Sign Up
          </button>
        </div>
      </div>
    </form>
  );
};

export default Login;
