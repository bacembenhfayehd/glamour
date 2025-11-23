"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function StoreAddProduct() {
  const categories = ["Homme", "Femme", "Enfant"];
  const souscategories = [
    "Sport",
    "Casual",
    "Chic",
    "Outdoor",
    "Streetwear",
    "Mode",
    "Minimaliste",
    "Garçon",
    "Fille",
  ];

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    price: 0,
    mainCategory: "",
    subCategory: "",
    stock:0
  });
  const [loading, setLoading] = useState(false);

  const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Réduire les dimensions si trop grande
        const maxWidth = 1024;
        const maxHeight = 1024;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.7 // 70% qualité
        );
      };
    };
  });
};

  const createProduct = async (productData, imageFiles) => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      formData.append(key, productData[key]);
    });
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }
    try {
      const response = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const onChangeHandler = (e) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (
      !productInfo.name ||
      !productInfo.description ||
      !productInfo.price ||
      !productInfo.mainCategory ||
      !productInfo.subCategory ||
      !productInfo.stock
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const imageArray = Object.values(images).filter((img) => img !== null);
    if (imageArray.length === 0) {
      toast.error("Veuillez ajouter au moins une image");
      return;
    }

    setLoading(true);
    try {
      await createProduct(productInfo, imageArray);
      toast.success("Produit ajouté avec succès");
      setProductInfo({
        name: "",
        description: "",
        price: 0,
        mainCategory: "",
        subCategory: "",
        stock:0
      });
      setImages({ 1: null, 2: null, 3: null, 4: null });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
      <h1 className="text-2xl">
        Nouveau <span className="text-slate-800 font-medium">Produit</span>
      </h1>
      <p className="mt-7">Images</p>

      <div htmlFor="" className="flex gap-3 mt-4">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`images${key}`}>
            <Image
              width={300}
              height={300}
              className="h-15 w-auto border border-slate-200 rounded cursor-pointer"
              src={
                images[key]
                  ? URL.createObjectURL(images[key])
                  : assets.upload_area
              }
              alt=""
            />
            <input
              type="file"
              accept="image/*"
              id={`images${key}`}
              onChange={(e) =>
                setImages({ ...images, [key]: e.target.files[0] })
              }
              hidden
            />
          </label>
        ))}
      </div>

      <label htmlFor="" className="flex flex-col gap-2 my-6 ">
        Nom
        <input
          type="text"
          name="name"
          onChange={onChangeHandler}
          value={productInfo.name}
          placeholder="Nom du produit"
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded"
          required
        />
      </label>

      <label htmlFor="" className="flex flex-col gap-2 my-6 ">
        Description
        <textarea
          name="description"
          onChange={onChangeHandler}
          value={productInfo.description}
          placeholder="Description"
          rows={5}
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none"
          required
        />
      </label>

      <div className="flex gap-5">
        <label htmlFor="" className="flex flex-col gap-2 ">
          Prix (DT)
          <input
            type="number"
            name="price"
            onChange={onChangeHandler}
            value={productInfo.price}
            placeholder="0"
            rows={5}
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none"
            required
          />
        </label>
         <label htmlFor="" className="flex flex-col gap-2 ">
          Stock
          <input
            type="number"
            name="stock"
            onChange={onChangeHandler}
            value={productInfo.stock}
            placeholder="0"
            rows={5}
            className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none"
            required
          />
        </label>
      </div>

      <div className="flex flex-col">
        <select
          onChange={(e) =>
            setProductInfo({ ...productInfo, subCategory: e.target.value })
          }
          value={productInfo.subCategory}
          className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded"
          required
        >
          <option value="">Choisir sous-categorie</option>
          {souscategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          onChange={(e) =>
            setProductInfo({ ...productInfo, mainCategory: e.target.value })
          }
          value={productInfo.mainCategory}
          className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded"
          required
        >
          <option value="">Choisir categorie</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <br />

      <button
        type="submit"
        disabled={loading}
        className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition"
      >
        {loading ? "Ajout en cours..." : "Ajouter"}
      </button>
    </form>
  );
}
