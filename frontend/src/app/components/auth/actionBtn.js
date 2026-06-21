import Image from "next/image";

// for OAuth login buttons
const ActionBtn = ({ text, icon, provider }) => {
  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
  if (!backendOrigin) {
    return (
      <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {text} sign-in is unavailable because the backend origin is not configured.
      </p>
    );
  }
  return (
    <a
      className="border-[1px] py-2.5 rounded-lg mb-3 flex items-center border-black"
      href={`${backendOrigin}/auth/oauth/${provider}/start`}
    >
      <div className="flex-1">
        <Image src={icon} alt={text} width={25} height={25} className="mx-3" />
      </div>
      <span className="mx-auto"> Continue with {text}</span>
      <div className="flex-1" />
    </a>
  );
};

export default ActionBtn;
