'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Cake } from '@/lib/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Cake | null>(null);

  // Function declaration BEFORE useEffect
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cake));
    setProducts(productList);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
     
  }, []);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      basePrice: Number(formData.get('basePrice')),
      imageUrl: formData.get('imageUrl') as string,
      category: formData.get('category') as string,
      orderCount: 0,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, 'products'), newProduct);
    fetchProducts();
    e.currentTarget.reset();
  };

  const handleUpdateProduct = async (product: Cake) => {
    const docRef = doc(db, 'products', product.id);
    await updateDoc(docRef, {
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" placeholder="Product Name" required className="px-3 py-2 border rounded-lg" />
            <input name="category" placeholder="Category" required className="px-3 py-2 border rounded-lg" />
          </div>
          <textarea name="description" placeholder="Description" required className="w-full px-3 py-2 border rounded-lg" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <input name="basePrice" type="number" placeholder="Price (₹)" required className="px-3 py-2 border rounded-lg" />
            <input name="imageUrl" placeholder="Image URL" required className="px-3 py-2 border rounded-lg" />
          </div>
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
            Add Product
          </button>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">All Products</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg">
              {editingProduct?.id === product.id ? (
                <div className="space-y-2">
                  <input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    value={editingProduct.basePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateProduct(editingProduct)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-600">₹{product.basePrice} • {product.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
