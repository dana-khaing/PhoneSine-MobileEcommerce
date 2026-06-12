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
  const [reviews, setReviews] = useState({ averageRating: 0, reviewCount: 0, reviews: [] });
  const [review, setReview] = useState({ rating: 5, title: "", body: "" });
  const [recommendations, setRecommendations] = useState([]);
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
  const loadReviews = () => fetch(`${process.env.NEXT_PUBLIC_API_REVIEWS_URL}/products/${params.id}`).then((response) => response.json()).then(setReviews);
  useEffect(loadReviews, [params.id]);
  useEffect(() => { fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}/${params.id}/recommendations`).then((response) => response.json()).then(setRecommendations); }, [params.id]);

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
  const submitReview = async (event) => {
    event.preventDefault();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_REVIEWS_URL}/products/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify(review),
    });
    setMessage(response.ok ? "Review submitted for moderation." : await response.text());
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
        <p className="mt-3 text-sm">{reviews.averageRating.toFixed(1)} / 5 from {reviews.reviewCount} reviews</p>
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
        {product.preorderDate && <p className="mt-3">Preorder release: {new Date(product.preorderDate).toLocaleDateString()}</p>}
        <button disabled={availableStock === 0 && !product.allowBackorder} onClick={addToCart} className="mt-8 rounded bg-neutral-900 px-6 py-3 text-white disabled:opacity-40">{availableStock === 0 && product.allowBackorder ? "Backorder" : product.preorderDate ? "Preorder" : "Add to cart"}</button>
        <button onClick={saveToWishlist} className="ml-2 mt-8 rounded border px-6 py-3">Save to wishlist</button>
        {message && <p className="mt-3 text-sm">{message}</p>}
        <section className="mt-10 border-t pt-6">
          <h2 className="text-xl font-bold">Customer reviews</h2>
          {reviews.reviews.map((item) => <article key={item.id} className="mt-4 rounded border p-3"><strong>{item.rating}/5 · {item.title}</strong><p>{item.body}</p><small>{item.verifiedPurchase ? "Verified purchase" : "Customer review"}</small></article>)}
          <form onSubmit={submitReview} className="mt-6 grid gap-2">
            <select className="rounded border p-2" value={review.rating} onChange={(event) => setReview((current) => ({ ...current, rating: Number(event.target.value) }))}>{[5,4,3,2,1].map((rating) => <option key={rating}>{rating}</option>)}</select>
            <input className="rounded border p-2" placeholder="Review title" value={review.title} onChange={(event) => setReview((current) => ({ ...current, title: event.target.value }))} required />
            <textarea className="rounded border p-2" placeholder="Review" value={review.body} onChange={(event) => setReview((current) => ({ ...current, body: event.target.value }))} required />
            <button className="rounded border px-4 py-2">Submit review</button>
          </form>
        </section>
        {recommendations.length > 0 && <section className="mt-10 border-t pt-6"><h2 className="text-xl font-bold">Related products</h2>{recommendations.map((item) => <Link key={item.id} className="mt-2 block underline" href={`/products/${item.id}`}>{item.name} · £{item.price.toFixed(2)}</Link>)}</section>}
      </section>
    </main>
  );
}
