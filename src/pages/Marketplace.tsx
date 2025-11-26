/**
 * Marketplace - Buy & Sell Quebec Products
 * Stripe-integrated e-commerce
 */

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Button } from '../components/ui/Button';
import { purchaseProduct, calculateMarketplaceFees } from '../services/stripeService';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toast';

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  is_sold: boolean;
  created_at: string;
  seller?: any;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { id: 'all', name: 'Tout', icon: '🛍️' },
    { id: 'merch', name: 'Merch', icon: '👕' },
    { id: 'tickets', name: 'Billets', icon: '🎫' },
    { id: 'art', name: 'Art', icon: '🎨' },
    { id: 'food', name: 'Bouffe', icon: '🍟' },
    { id: 'other', name: 'Autre', icon: '📦' },
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, seller:users(*)')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    try {
      await purchaseProduct(product.id, product.price);
      // After successful payment, order will be created
      toast.success('Achat en cours! 🎉');
      loadProducts(); // Refresh list
    } catch (error: any) {
      console.error('Purchase error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <p className="text-white/60">Achète et vends localement</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + Vendre
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des produits..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gold-500 text-black font-bold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center text-white/60 py-12">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-white/60 py-12">
            Aucun produit trouvé. Sois le premier à vendre! 🚀
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all group"
              >
                {/* Image */}
                <div className="aspect-square bg-black relative overflow-hidden">
                  {product.image_urls?.[0] ? (
                    <img
                      src={product.image_urls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white mb-1 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gold-500">
                      {(product.price / 100).toFixed(2)}$
                    </span>
                    <Button
                      onClick={() => handlePurchase(product)}
                      size="sm"
                      className="bg-gold-500 text-black hover:bg-gold-600"
                    >
                      Acheter
                    </Button>
                  </div>

                  {/* Seller */}
                  {product.seller && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                      <span className="text-xs text-white/60">
                        @{product.seller.username}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

