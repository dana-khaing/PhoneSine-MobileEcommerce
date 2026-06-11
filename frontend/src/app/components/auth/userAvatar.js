import React, { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { clearSession } from "./session.mjs";

const UserAvator = () => {
  const { userName, setUserIsLogin, setUserName, setUserEmail } =
    useContext(AuthContext);
  const handleLogout = async () => {
    await clearSession();
    setUserIsLogin(false);
    setUserName("");
    setUserEmail("");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="p-2">
          <div className=" flex justify-center items-center">
            <div className="flex-auto">
              <UserCheck className="w-5 h-5 text-neutral-600 hover:text-black" />
            </div>
            <div className="pl-1 text-neutral-600">
              {userName.toUpperCase()}
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" p-2">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/orders">My Orders</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default UserAvator;
