import Image from "next/image";

// for OAuth login buttons
const ActionBtn = ({ text, icon }) => {
  return (
    <button className="border-[1px] py-2.5 rounded-lg mb-3 flex items-center border-black">
      <div className="flex-1">
        <Image src={icon} alt={text} width={25} height={25} className="mx-3" />
      </div>
      <span className="mx-auto"> Continue with {text}</span>
      <div className="flex-1" />
    </button>
  );
};

export default ActionBtn;
