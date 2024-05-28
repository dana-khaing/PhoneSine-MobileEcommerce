import { CircleUserRound } from "lucide-react";
import { useState } from "react";
import Login from "./auth/login";
import Register from "./auth/register";

const Auth = () => {
  const [isClickedlogin, setIsClickedlogin] = useState(false);
  const [isClickedSignup, setIsClickedSignup] = useState(false);

  const openlogincard = () => {
    setIsClickedlogin(true);
  };

  const closeallcard = () => {
    setIsClickedlogin(false);
    setIsClickedSignup(false);
  };

  const handlesignup = () => {
    setIsClickedlogin(false);
    setIsClickedSignup(true);
  };

  const handlelogin = () => {
    setIsClickedSignup(false);
    setIsClickedlogin(true);
  };

  return (
    <div>
      <button onClick={openlogincard} className="p-1.5">
        <CircleUserRound className="w-5 h-5 text-neutral-600 hover:text-black" />
      </button>
      {isClickedlogin && (
        <Login closeallcard={closeallcard} handlesignup={handlesignup} />
      )}
      {isClickedSignup && (
        <Register closeallcard={closeallcard} handlelogin={handlelogin} />
      )}
    </div>
  );
};

export default Auth;
