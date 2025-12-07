'use client'
import { PackageX, Home, ShoppingBag } from "lucide-react";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


export default function Product() {

    const { productId} = useParams();
    const dispatch = useDispatch();
    const { list: products, loading } = useSelector(state => state.product);
    const [notFound, setNotFound] = useState(false);

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

    useEffect(() => {
    if (!loading && products.length > 0 && !product) {
        setNotFound(true);
    }
}, [loading, products, product]);

    // IMPORTANT: Attendre le chargement ET que products ne soit pas vide
    if (loading || products.length === 0) {
        return (
            <div className="mx-6 min-h-screen flex items-center justify-center">
                <p className="text-slate-600">Chargement du produit...</p>
            </div>
        );
    }

    if (notFound || !product) {
    return (
        <div className="mx-6 min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageX size={48} className="text-slate-400" />
                </div>
                
                <h2 className="text-3xl font-semibold text-slate-700 mb-3">
                    Produit introuvable
                </h2>
                
                <p className="text-slate-500 mb-8">
                    Désolé, ce produit n'est plus disponible ou a été supprimé de notre catalogue.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
                    >
                        <Home size={18} />
                        Retour à l'accueil
                    </button>
                    
                    <button
                        onClick={() => router.push('/shop')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        <ShoppingBag size={18} />
                        Voir la boutique
                    </button>
                </div>
            </div>
        </div>
    );
}

// Optionnel : Améliorer le loader existant
if (loading || products.length === 0) {
    return (
        <div className="mx-6 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Chargement du produit...</p>
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