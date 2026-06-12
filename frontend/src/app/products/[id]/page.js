"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../contexts/cartContext";
import { productImageUrl } from "../productImages.mjs";

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("Loading product...");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}/${params.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.images?.[0] || null);
        setSelectedVariantId(data.variants?.[0]?.id ? String(data.variants[0].id) : "");
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [params.id]);

  if (!product) return <main className="mx-auto max-w-5xl px-6 py-20">{message}</main>;
  const selectedVariant = product.variants?.find((variant) => String(variant.id) === selectedVariantId);
  const price = selectedVariant?.price ?? product.price;
  const availableStock = selectedVariant?.availableStock ?? product.availableStock;
  const addToCart = () => addItem({
    ...product,
    ...(selectedVariant ? {
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
    } : {}),
  });
  const saveToWishlist = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_SAVED_URL}/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ productId: product.id, variantId: selectedVariant?.id }),
    });
    setMessage(response.ok ? "Saved to wishlist." : await response.text());
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2">
      <div className="flex min-h-96 items-center justify-center rounded bg-neutral-100">
        <div>
          <img src={productImageUrl(selectedImage, process.env.NEXT_PUBLIC_BACKEND_ORIGIN)} alt={selectedImage?.altText || product.name} className="mx-auto max-h-80 max-w-full object-contain" />
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {product.images?.map((image) => (
              <button key={image.id} onClick={() => setSelectedImage(image)} className="rounded border p-1">
                <img src={productImageUrl(image, process.env.NEXT_PUBLIC_BACKEND_ORIGIN)} alt={image.altText} className="h-16 w-16 object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <section>
        <Link href="/products" className="text-sm underline">Back to products</Link>
        <p className="mt-8 text-sm uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>
        <p className="mt-5 text-neutral-600">{product.description || "No product description available."}</p>
        {product.category && <p className="mt-3 text-sm text-neutral-500">Category: {product.category.name}</p>}
        {product.variants?.length > 0 && (
          <select className="mt-6 w-full rounded border p-3" value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)}>
            {product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name} · £{variant.price.toFixed(2)}</option>)}
          </select>
        )}
        <p className="mt-8 text-2xl font-bold">£{price.toFixed(2)}</p>
        <p className="mt-2 text-sm">{availableStock > 0 ? `${availableStock} available` : "Out of stock"}</p>
        {Object.keys(product.specifications || {}).length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(product.specifications).map(([key, value]) => <div key={key}><dt className="font-semibold">{key}</dt><dd>{String(value)}</dd></div>)}
          </dl>
        )}
        <button disabled={availableStock === 0} onClick={addToCart} className="mt-8 rounded bg-neutral-900 px-6 py-3 text-white disabled:opacity-40">Add to cart</button>
        <button onClick={saveToWishlist} className="ml-2 mt-8 rounded border px-6 py-3">Save to wishlist</button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </section>
    </main>
  );
}
