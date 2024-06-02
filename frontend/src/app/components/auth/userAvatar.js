import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";
const UserAvator = () => {
  const { userName } = useContext(AuthContext);
  return (
    <Button variant="ghost" className="p-2">
      <div className=" flex justify-center items-center">
        <div className="flex-auto">
          <UserCheck className="w-5 h-5 text-neutral-600 hover:text-black" />
        </div>
        <div className="pl-1 text-neutral-600">{userName.toUpperCase()}</div>
      </div>
    </Button>
  );
};
export default UserAvator;
