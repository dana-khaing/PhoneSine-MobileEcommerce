"use Client";
import { CircleUserRound } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import Login from "./auth/login";
import Register from "./auth/register";
import UserAvator from "./auth/userAvatar";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../contexts/authContext";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const { toast } = useToast();
  const [isClickedlogin, setIsClickedlogin] = useState(false);
  const [isClickedSignup, setIsClickedSignup] = useState(false);
  const { userIsLogin, setUserName, setUserEmail, setUserIsLogin } =
    useContext(AuthContext);

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

  const handleSessionTimeOut = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const exp = new Date(decoded.exp * 1000);
      const currentTime = new Date();
      const timeLeft = exp - currentTime;

      if (timeLeft < 0) {
        localStorage.removeItem("token");
        setUserIsLogin(false);
        setUserName("");
        setUserEmail("");
        toast({
          className: " bg-neutral-900 text-white",
          title: "Login failed.",
          description: "Token expired",
        });
      } else {
        setUserName(decoded.username);
        setUserEmail(decoded.email);
        setUserIsLogin(true);
      }
    } catch (error) {
      toast({
        className: " bg-neutral-900 text-white",
        title: "Login failed.",
        description: "Invalid token",
      });
      localStorage.removeItem("token");
      setUserIsLogin(false);
      setUserName("");
      setUserEmail("");
    }
  };

  useEffect(() => {
    handleSessionTimeOut();
  }, []);

  return (
    <div className="flex text-sm items-center">
      {userIsLogin ? (
        <UserAvator />
      ) : (
        <>
          <button onClick={openlogincard} className="p-1.5">
            <CircleUserRound className="w-5 h-5 text-neutral-600 hover:text-black" />
          </button>
          {isClickedlogin && (
            <Login closeallcard={closeallcard} handlesignup={handlesignup} />
          )}
          {isClickedSignup && (
            <Register closeallcard={closeallcard} handlelogin={handlelogin} />
          )}
        </>
      )}
    </div>
  );
};

export default Auth;
