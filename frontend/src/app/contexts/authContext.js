"use client";
import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userIsLogin, setUserIsLogin] = useState(false);

  const value = {
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userIsLogin,
    setUserIsLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
