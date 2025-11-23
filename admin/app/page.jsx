'use client'

import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { useAdmin } from "@/context/AdminContext"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, User } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const { 
    dashboardStats, 
    orders,
    loading, 
    error,
    fetchDashboardData 
  } = useAdmin();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const dashboardCardsData = [
    { 
      title: 'Total Produits', 
      value: dashboardStats.totalProducts, 
      icon: ShoppingBasketIcon 
    },
    { 
      title: 'Total Revenues', 
      value: `${dashboardStats.totalRevenue.toFixed(2)} DT`, 
      icon: CircleDollarSignIcon 
    },
    { 
      title: 'Total Commandes', 
      value: dashboardStats.totalOrders, 
      icon: TagsIcon 
    },
    { 
      title: 'Total Clients', 
      value: dashboardStats.totalUsers, 
      icon: User 
    },
  ];

  if (loading.products || loading.orders || loading.users) {
    return <Loading />;
  }

  if (error.products || error.orders || error.users) {
    return (
      <div className="p-4 text-red-500">
        Erreur lors du chargement des données
      </div>
    );
  }

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={orders} />
        </div>
    )
}