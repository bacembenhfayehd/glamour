'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


export default function Product() {

    const { productId} = useParams();
    const dispatch = useDispatch();
    const { list: products, loading } = useSelector(state => state.product);

    // DEBUG - Ajoutez ces logs
    console.log('ID from URL:', productId);
    console.log('Products:', products);
    console.log('Loading:', loading);

    const product = products.find((p) => p._id === productId);
    console.log('Found product:', product);

    useEffect(() => {
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
        scrollTo(0, 0)
    }, [dispatch, products.length]);

    // IMPORTANT: Attendre le chargement ET que products ne soit pas vide
    if (loading || products.length === 0) {
        return (
            <div className="mx-6 min-h-screen flex items-center justify-center">
                <p className="text-slate-600">Chargement du produit...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="mx-6 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600">Produit introuvable</p>
                    <p className="text-sm text-slate-400 mt-2">ID: {id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-gray-600 text-sm mt-8 mb-5">
                    Accueil / Produits / {product?.mainCategory} / {product?.subCategory}
                </div>
                <ProductDetails product={product} />
                <ProductDescription product={product} />
            </div>
        </div>
    );
}