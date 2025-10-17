'use client'

import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import LatestProducts from "@/components/LatestProducts";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


export default function Home() {
    const dispatch = useDispatch();
    const { list: products } = useSelector(state => state.product);

    useEffect(() => {
        // Only fetch if products aren't already loaded
        if (products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, products.length]);
    return (
        <div>
            <Hero />
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
