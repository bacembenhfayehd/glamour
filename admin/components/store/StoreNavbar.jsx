'use client'
import Link from "next/link"

const StoreNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">gla</span>mour<span className="text-green-600 text-5xl leading-0">.</span>
            </Link>
            <div className="flex items-center gap-3">
                <p>Bonjour, Admin</p>
            </div>
        </div>
    )
}

export default StoreNavbar