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

const UserAvator = () => {
  const { userName, setUserIsLogin, setUserName, setUserEmail } =
    useContext(AuthContext);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserIsLogin(false);
    setUserName("");
    setUserEmail("");
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="p-2">
          <div className=" flex justify-center items-center">
            <div className="flex-auto">
              <UserCheck className="w-5 h-5 text-neutral-600 hover:text-black" />
            </div>
            <div className="pl-1 text-neutral-600">
              {userName.toUpperCase()}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" p-2">
        <DropdownMenuGroup>
          <DropdownMenuItem>My Account</DropdownMenuItem>
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
