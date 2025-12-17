'use client'
import { clearError, getProfile, login, logout, register } from "@/lib/features/auth/authSlice";
import { Lock, Mail, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AboutModal from "./AboutModal";
import { fetchProducts } from "@/lib/features/product/productSlice";
import SearchModal from "./SearchModal";


const AuthModal = ({ isOpen, onClose}) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.auth);
    const [mode, setMode] = useState('signup');
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: ''
    });

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            if (mode === 'signup') {
                await dispatch(register(formData)).unwrap();
            } else {
                await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
            }
            onClose();
            setFormData({ email: '', name: '', password: '' });
        } catch (err) {
            // Error handled by Redux
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-slideUp">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                >
                    <X size={20} />
                </button>

                {/* Logo */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-slate-700">
                        <span className="text-green-600">gla</span>mour<span className="text-green-600 text-4xl">.</span>
                    </h2>
                    <p className="text-slate-500 mt-2">
                        {mode === 'signup' ? 'Créer un compte' : 'Bon retour parmi nous'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                    {mode === 'signup' && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Nom d'utilisateur"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Adresse email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
                            required
                        />
                    </div>

                    {mode === 'signin' && (
                        <div className="flex items-center justify-end">
                            <button type="button" className="text-sm text-green-600 hover:text-green-700 transition-colors">
                                Mot de passe oublié ?
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5"
                    >
                        {loading ? 'Chargement...' : (mode === 'signup' ? "S'inscrire" : 'Se connecter')}

                    </button>
                </div>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <p className="text-slate-600 text-sm">
                        {mode === 'signup' ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}
                        {' '}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'signup' ? 'signin' : 'signup');
                                setFormData({ email: '', name: '', password: '' });
                                dispatch(clearError());
                            }}
                            className="text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                            {mode === 'signup' ? 'Se connecter' : "S'inscrire"}
                        </button>
                    </p>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500">ou continuer avec</span>
                    </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};


const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.itemCount)
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    useEffect(() => {
    dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !user) {
            dispatch(getProfile());
        }
    }, [dispatch, user]);

    const handleLogout = async () => {
        await dispatch(logout());
    };

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <>
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">gla</span>mour<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Accueil</Link>
                        <Link href="/shop">Boutique</Link>
                        <AboutModal/>
                        <Link href="/orders">Commandes</Link>

                       <button 
    onClick={() => setIsSearchModalOpen(true)}
    className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
>
    <Search size={18} className="text-slate-600" />
    <span className="text-slate-600">Rechercher des produits</span>
</button>


                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Panier
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="px-8 py-2 bg-green-500 hover:bg-green-600 transition text-white rounded-full">
                            Déconnexion
                        </button>

                        ):(<button onClick={() => setIsModalOpen(true)} className="px-8 py-2 bg-green-500 hover:bg-green-600 transition text-white rounded-full">
                            S'inscrire
                        </button>)}
                        

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {isAuthenticated ? (<button onClick={handleLogout} className="px-7 py-1.5 bg-green-500 hover:bg-green-600 text-sm transition text-white rounded-full">
                            Déconnexion
                        </button>):(<button onClick={() =>setIsModalOpen(true)} className="px-7 py-1.5 bg-green-500 hover:bg-green-600 text-sm transition text-white rounded-full">
                            S'inscrire
                        </button>)}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
        <AuthModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialMode="signup"
            />

            <SearchModal 
    isOpen={isSearchModalOpen} 
    onClose={() => setIsSearchModalOpen(false)} 
/>
        </>
    )
}


export default Navbar