import { Inter } from "next/font/google";
import clsx from "clsx";
import { X } from "lucide-react";
import ActionBtn from "./actionBtn";
import { useState, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/app/contexts/authContext";

const inter = Inter({ subsets: ["latin"] });

const Register = ({ closeallcard, handlelogin }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const { setUserName, setUserEmail, setUserIsLogin } = useContext(AuthContext);
  const { toast } = useToast();
  const handlekey = (e) => {
    if (e.key === "Enter") {
      handleRegister(e);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // console.log(firstname, lastname, email, password, confirmpassword);
    if (password !== confirmpassword) {
      toast({
        className: " bg-neutral-900 text-white",
        title: "Passwords must be 'EQUAL' .",
        description: "Please check your password and comfirm passward .",
      });
      return;
    }
    const data = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        password,
      }),
    });

    if (data.status === 200) {
      // if we want to login immediately after registering

      // const gotData = await data.json();
      // setUserIsLogin(true);
      // setUserName(gotData.username);
      // setUserEmail(gotData.email);
      // closeallcard();
      toast({
        className: " bg-neutral-900 text-white",
        title: "Register success.",
        description: "Please login to continue .",
      });
      handlelogin();
    } else {
      const error = await data.text();
      toast({
        className: " bg-neutral-900 text-white",
        title: "Register failed .",
        description: error,
      });
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      onKeyPress={handlekey}
      className="fixed inset-0 flex items-center justify-center z-10 bg-gray-800 bg-opacity-40 backdrop-blur-md"
    >
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
            {/* // Add the firstname state to the value attribute of the input
            element */}
            <input
              type="text"
              className="border-[1px] p-3 h-11 w-[100%] rounded-lg border-black"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
          </div>
          <div className="pl-2 w-[50%]">
            <div className="pb-1">
              <label className="font-normal text-sm">Last name :</label>
            </div>
            {/* // Add the lastname state to the value attribute of the input
            element */}
            <input
              type="text"
              className="border-[1px] p-3 h-11 w-[100%] rounded-lg border-black"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
        </div>
        <label className="font-normal text-sm" htmlFor="emailInput">
          Email Address :
        </label>
        {/* // Add the email state to the value attribute of the input element */}
        <input
          type="email"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="font-normal text-sm" htmlFor="passwordInput">
          Password :
        </label>
        {/* // Add the password state to the value attribute of the input element */}
        <input
          type="password"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="font-normal text-sm" htmlFor="confirmPasswordInput">
          Confirm Password :
        </label>
        <input
          type="password"
          className="border-[1px] p-3 h-11 rounded-lg border-black"
          value={confirmpassword}
          onChange={(e) => setConfirmpassword(e.target.value)}
          required
        />
        <div className=" text-xs text-neutral-500">
          <p>Password must contain : </p>
          <p>- at least 6 characters with no space *</p>
          <p>- at least a number *</p>
          <p>- at least a uppercase letter *</p>
          <p>- at least a lowercase letter *</p>
          <p>- at least a special character *</p>
        </div>
        <button
          className="bg-neutral-900 text-white py-3 rounded-lg mt-1"
          type="submit"
        >
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
