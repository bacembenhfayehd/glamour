'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { orderDummyData } from "@/assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrders } from "@/lib/features/order/orderSlice";

export default function Orders() {

    const dispatch = useDispatch();
    const { userOrders, userOrdersPagination, loading, error } = useSelector(state => state.orders);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(getUserOrders({ 
            page: currentPage, 
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        }));
    }, [dispatch, currentPage]);

    if (loading) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center">
                <h1 className="text-2xl text-slate-400">Chargement des commandes...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center">
                <h1 className="text-2xl text-red-400">{error}</h1>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            {userOrders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading="Commandes" text={`Affichage de  ${userOrders.length} commandes`} linkText={'Page accueil'} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userOrders.map((order) => (
                                    <OrderItem order={order} key={order._id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">Vous n'avez pas de commandes</h1>
                </div>
            )}
        </div>
    )
}