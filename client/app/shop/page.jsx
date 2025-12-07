'use client'
import { Suspense, useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts } from "@/lib/features/product/productSlice"

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()
    const dispatch = useDispatch()
    const [selectedMainCategory, setSelectedMainCategory] = useState('all')
    const [selectedSubCategory, setSelectedSubCategory] = useState('all')

    const { list: products } = useSelector(state => state.product)
    
    const mainCategories = ['Homme', 'Femme', 'Enfant']
    const subCategories = {
        all: ['Sport', 'Casual', 'Chic', 'Outdoor', 'Streetwear', 'Mode', 'Minimaliste', 'Garçon', 'Fille'],
        Homme: ['Sport', 'Casual', 'Chic', 'Outdoor', 'Streetwear', 'Mode', 'Minimaliste'],
        Femme: ['Sport', 'Casual', 'Chic', 'Outdoor', 'Streetwear', 'Mode', 'Minimaliste'],
        Enfant: ['Garçon', 'Fille']
    }

     useEffect(() => {
        dispatch(fetchProducts())
    }, [dispatch])

    const filteredProducts = products.filter(product => {
    const matchesSearch = search 
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true
    
    const matchesMainCategory = selectedMainCategory === 'all' 
        ? true 
        : product.mainCategory === selectedMainCategory
    
    const matchesSubCategory = selectedSubCategory === 'all'
        ? true
        : product.subCategory === selectedSubCategory
    
    return matchesSearch && matchesMainCategory && matchesSubCategory
})

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  Tous les <span className="text-slate-700 font-medium">Produits</span></h1>
                <div className="mb-8 space-y-4">
    {/* Main Category Filter */}
    <div>
        <label className="text-sm font-medium mb-2 block">Categorie</label>
        <div className="flex gap-2 flex-wrap">
            <button
                onClick={() => {
                    setSelectedMainCategory('all')
                    setSelectedSubCategory('all')
                }}
                className={`px-4 py-2 rounded-lg ${selectedMainCategory === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
            >
                Tous
            </button>
            {mainCategories.map(cat => (
                <button
                    key={cat}
                    onClick={() => {
                        setSelectedMainCategory(cat)
                        setSelectedSubCategory('all')
                    }}
                    className={`px-4 py-2 rounded-lg ${selectedMainCategory === cat ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
    </div>

    {/* Sub Category Filter */}
    <div>
        <label className="text-sm font-medium mb-2 block">sous-categorie</label>
        <div className="flex gap-2 flex-wrap">
            <button
                onClick={() => setSelectedSubCategory('all')}
                className={`px-4 py-2 rounded-lg ${selectedSubCategory === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
            >
                Tous
            </button>
            {subCategories[selectedMainCategory].map(sub => (
                <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-4 py-2 rounded-lg ${selectedSubCategory === sub ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                >
                    {sub}
                </button>
            ))}
        </div>
    </div>
</div>
                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}