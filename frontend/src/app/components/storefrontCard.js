import Link from "next/link";

export default function StorefrontCard({ product }) {
  const image = product.images?.[0]?.url
    ? `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}${product.images[0].url}`
    : "/iph15-pro.jpeg";
  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm shadow-neutral-200/70 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-300/40">
      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-neutral-100 to-yellow-50 p-5">
        <img src={image} alt={product.images?.[0]?.altText || product.name} className="max-h-full object-contain" />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <h3 className="mt-1 font-black tracking-tight">{product.name}</h3>
        <div className="mt-4 flex items-center justify-between"><span className="text-lg font-black">£{product.price.toFixed(2)}</span><Link className="rounded-full border px-3 py-1 text-sm font-semibold transition group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white" href={`/products/${product.id}`}>View</Link></div>
      </div>
    </article>
  );
}
