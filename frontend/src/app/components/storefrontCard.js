import Link from "next/link";

export default function StorefrontCard({ product }) {
  const image = product.images?.[0]?.url
    ? `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}${product.images[0].url}`
    : "/iph15-pro.jpeg";
  return (
    <article className="overflow-hidden rounded border bg-white">
      <div className="flex h-52 items-center justify-center bg-neutral-100 p-5">
        <img src={image} alt={product.images?.[0]?.altText || product.name} className="max-h-full object-contain" />
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <h3 className="mt-1 font-bold">{product.name}</h3>
        <div className="mt-4 flex items-center justify-between"><span>£{product.price.toFixed(2)}</span><Link className="rounded border px-3 py-1 text-sm" href={`/products/${product.id}`}>View</Link></div>
      </div>
    </article>
  );
}
