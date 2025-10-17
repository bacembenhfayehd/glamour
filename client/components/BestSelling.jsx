"use client";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";

const BestSelling = () => {
  const displayQuantity = 8;
  const { list: products, loading } = useSelector((state) => state.product);

  const bestSellingProducts = products
    .slice()
    .sort((a, b) => {
      const aRatingCount = a.rating?.length || 0;
      const bRatingCount = b.rating?.length || 0;

      if (aRatingCount !== bRatingCount) {
        return bRatingCount - aRatingCount;
      }

      return a.stock - b.stock;
    })
    .slice(0, displayQuantity);

  if (loading) {
    return (
      <div className="px-6 my-30 max-w-6xl mx-auto">
        <Title
          title="Best Selling"
          description="Loading products..."
          href="/shop"
        />
        <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
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
          title="Best Selling"
          description="No products available"
          href="/shop"
        />
      </div>
    );
  }

  return (
    <div className="px-6 my-30 max-w-6xl mx-auto">
      <Title
        title="Meilleures ventes"
        description={`Affichage de ${bestSellingProducts.length} sur ${products.length} produits`}
        href="/shop"
      />
      <div className="mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12">
        {bestSellingProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSelling;
