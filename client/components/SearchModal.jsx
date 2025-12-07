import { Search, X, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const SearchModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { list: products, loading } = useSelector(state => state.product);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Extraire les catégories uniques des produits
    const mainCategories = [...new Set(products.map(p => p.mainCategory))];
    const subCategories = [...new Set(products.map(p => p.subCategory))];

    useEffect(() => {
        if (isOpen && products.length > 0) {
            filterProducts();
        }
    }, [searchTerm, selectedMainCategory, selectedSubCategory, products, isOpen]);

    const filterProducts = () => {
        let filtered = products;

        // Filtrer par nom
        if (searchTerm.trim()) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrer par catégorie principale
        if (selectedMainCategory) {
            filtered = filtered.filter(product =>
                product.mainCategory === selectedMainCategory
            );
        }

        // Filtrer par sous-catégorie
        if (selectedSubCategory) {
            filtered = filtered.filter(product =>
                product.subCategory === selectedSubCategory
            );
        }

        setFilteredProducts(filtered.slice(0, 6)); // Limiter à 6 résultats
    };

    const handleProductClick = (productId) => {
        router.push(`/product/${productId}`);
        onClose();
        resetFilters();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedMainCategory('');
        setSelectedSubCategory('');
        setFilteredProducts([]);
    };

    const handleClose = () => {
        onClose();
        resetFilters();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fadeIn">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl animate-slideDown">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-slate-700 flex items-center gap-2">
                            <Search size={24} className="text-green-600" />
                            Rechercher des produits
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom de produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                            autoFocus
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-slate-600" />
                        <select
                            value={selectedMainCategory}
                            onChange={(e) => setSelectedMainCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-green-500 text-slate-700 text-sm cursor-pointer"
                        >
                            <option value="">Toutes les catégories</option>
                            {mainCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={selectedSubCategory}
                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-green-500 text-slate-700 text-sm cursor-pointer"
                        >
                            <option value="">Tous les styles</option>
                            {subCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {(searchTerm || selectedMainCategory || selectedSubCategory) && (
                            <button
                                onClick={resetFilters}
                                className="ml-auto text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 mt-4">Chargement...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => handleProductClick(product._id)}
                                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                >
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={product.images[0]?.url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-slate-700 group-hover:text-green-600 transition-colors truncate">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-sm text-slate-600 font-medium">
                                                {product.price} TND
                                            </span>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-500">
                                                {product.mainCategory}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">
                                {searchTerm || selectedMainCategory || selectedSubCategory
                                    ? "Aucun produit trouvé"
                                    : "Commencez à taper pour rechercher"}
                            </p>
                            <p className="text-slate-400 text-sm mt-2">
                                Essayez d'autres mots-clés ou filtres
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {filteredProducts.length > 0 && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
                        <button
                            onClick={() => {
                                router.push('/shop');
                                handleClose();
                            }}
                            className="w-full py-2.5 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                        >
                            Voir tous les produits →
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SearchModal;