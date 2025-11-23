"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import { productDummyData } from "@/assets/assets";
import { Edit2, Trash2 } from "lucide-react";
import EditProductModal from "@/components/EditProductModal";

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "DT";

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getAllProducts = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const url = `http://localhost:5000/api/admin/products${
        params.toString() ? "?" + params.toString() : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la récupération");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw error;
    }
  };

  const updateProduct = async (productId, updateData) => {
  try {
    const formData = new FormData();
    
    Object.keys(updateData).forEach(key => {
      formData.append(key, updateData[key]);
    });
    
    const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
      method: 'PUT',
      body: formData, 
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la mise à jour');
    }
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    throw error;
  }
};


  const handleEditClick = (product) => {
  setSelectedProduct(product);
  setIsModalOpen(true);
};

const handleModalClose = () => {
  setIsModalOpen(false);
  setSelectedProduct(null);
};

const handleUpdate = async (updatedData) => {
  try {
    // Filtrer les champs modifiés seulement (optionnel)
    const changedFields = {};
    if (updatedData.name !== selectedProduct.name) changedFields.name = updatedData.name;
    if (updatedData.mainCategory !== selectedProduct.mainCategory) changedFields.mainCategory = updatedData.mainCategory;
    if (updatedData.price !== selectedProduct.price) changedFields.price = parseFloat(updatedData.price);
    if (updatedData.stock !== selectedProduct.stock) changedFields.stock = parseFloat(updatedData.stock);
    
    // Utiliser toast.promise pour UX
    await toast.promise(
      updateProduct(selectedProduct._id, changedFields),
      {
        loading: 'Mise à jour en cours...',
        success: 'Produit mis à jour avec succès!',
        error: (err) => `Erreur: ${err.message}`,
      }
    );
    fetchProducts();
    
  } catch (error) {
    toast.error(error.message)
  }
};


  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la suppression");
      }
      const result = await response.json();
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );
      toast.success(result.message);
    } catch (error) {
      console.error("Erreur:", error);
      fetchProducts();
      toast.error(error.message);
    } 
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">
        Gestion des <span className="text-slate-800 font-medium">Produits</span>
      </h1>
      <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
        <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3 hidden md:table-cell">Description</th>

            <th className="px-4 py-3">Prix</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {products.map((product) => (
            <tr
              key={product._id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex gap-2 items-center">
                  <Image
                    width={40}
                    height={40}
                    className="p-1 shadow rounded cursor-pointer"
                    src={product.images[0].url}
                    alt=""
                  />
                  {product.name}
                </div>
              </td>
              <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">
                {product.description}
              </td>

              <td className="px-4 py-3">
                {currency} {product.price.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => handleEditClick(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={18} className="text-green-600" />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
      />
    </>
  );
}
