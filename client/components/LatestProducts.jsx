"use client";
import React from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";

const LatestProducts = () => {
  const displayQuantity = 4;
  const { list: products, loading } = useSelector((state) => state.product);
  const latestProducts = products
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, displayQuantity);

  if (loading) {
    return (
      <div className="px-6 my-30 max-w-6xl mx-auto">
        <Title
          title="Latest Products"
          description="Loading products..."
          href="/shop"
        />
        <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between">
          {[...Array(displayQuantity)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse h-60 w-60 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="px-6 my-30 max-w-6xl mx-auto">
        <Title
          title="Latest Products"
          description="No products available"
          href="/shop"
        />
      </div>
    );
  }

  return (
    <div className="px-6 my-30 max-w-6xl mx-auto">
      <Title
        title="Derniers produits"
        description={`Affichage ${latestProducts.length} sur ${products.length} produits`}
        href="/shop"
      />
      <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between">
        {latestProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default LatestProducts;
