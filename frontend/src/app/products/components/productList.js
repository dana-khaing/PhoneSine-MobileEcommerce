import ProductCard from "./productCard";

const products = [
  {
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
  {
    name: "PIXEL 7 PRO",
    brand: "Google",
    price: 899,
  },
  {
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
  {
    name: "PIXEL 7 PRO",
    brand: "Google",
    price: 899,
  },
  {
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
];

export default function ProductList() {
  return (
    <div className="grid grid-cols-4">
      {products?.map((product) => (
        <ProductCard
          brand={product.brand}
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}
