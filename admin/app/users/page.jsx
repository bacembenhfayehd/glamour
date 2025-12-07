"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";

export default function StoreManageUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getAllUsers = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/admin/users", {
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
    const users = result.data.users || [];
    
    // ✅ Normaliser les données : s'assurer que chaque user a bien _id
    const normalizedUsers = users.map(user => ({
      ...user,
      _id: user._id || user.id // Au cas où certains ont "id" au lieu de "_id"
    }));
    
    // Filtrer les utilisateurs actifs
    return normalizedUsers.filter(user => user.isActive !== false);
  } catch (error) {
    throw error;
  }
};

  const handleDeleteUser = async (userId) => {
    console.log("User ID to delete:", userId);
  console.log("confirmDelete object:", confirmDelete); // ← AJOUTE CETTE LIGNE
  
  if (!userId) {
    toast.error("ID utilisateur manquant");
    return;
  }
    if (!userId) {
      toast.error("ID utilisateur manquant");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/usersdelete/${userId}`, // Changé l'URL
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Gérer l'erreur des commandes en cours
        throw new Error(result.message || "Échec de la suppression");
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success("Utilisateur supprimé avec succès");
      setConfirmDelete(null);
    } catch (error) {
      console.error("Erreur:", error);
      // Afficher le message d'erreur spécifique (commandes en cours)
      toast.error(error.message, {
        duration: 4000, // Plus long pour lire le message
      });
      setConfirmDelete(null); // Fermer le modal même en cas d'erreur
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      console.log("Users fetched:", data); // ← AJOUTE CETTE LIGNE
    console.log("First user:", data[0]);
      setUsers(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl text-slate-500">
          Gestion des{" "}
          <span className="text-slate-800 font-medium">Utilisateurs</span>
        </h1>
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold">{users.length}</span>{" "}
          utilisateurs
        </div>
      </div>

      <div className="w-full max-w-6xl">
        <table className="w-full text-left ring ring-slate-200 rounded overflow-hidden text-sm">
          <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3 hidden lg:table-cell">Email</th>
              <th className="px-4 py-3 hidden md:table-cell">Inscription</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                {/* Utilisateur */}
                <td className="px-4 py-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 lg:hidden">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} />
                    {user.email}
                  </div>
                </td>

                {/* Date d'inscription */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} />
                    {formatDate(user.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {/* Supprimer */}
                    <button
                      onClick={() => setConfirmDelete(user)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 bg-white rounded-b-lg border-t border-slate-200">
            <User size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>

            <h3 className="text-xl font-semibold text-slate-800 text-center mb-2">
              Supprimer l'utilisateur ?
            </h3>

            <p className="text-slate-600 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold">{confirmDelete.name}</span> ?
              Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete._id)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
