/**
 * Premium VIP Subscription Page
 * Stripe-integrated subscription tiers
 */

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Button } from '../components/ui/Button';
import { subscribeToPremium } from '../services/stripeService';
import { supabase } from '../lib/supabase';
import { usePremium } from '../hooks/usePremium';

type SubscriptionTier = 'free' | 'bronze' | 'silver' | 'gold';

export default function Premium() {
  const { tier: currentTier, isLoading } = usePremium();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('bronze');

  const tiers = [
    {
      id: 'free' as const,
      name: 'Gratuit',
      price: 0,
      features: [
        'Accès de base',
        'Publier des posts',
        'Commenter et liker',
        'Stories 24h',
      ],
      color: 'from-gray-600 to-gray-800',
    },
    {
      id: 'bronze' as const,
      name: 'Bronze',
      price: 4.99,
      features: [
        'Tout Gratuit +',
        '🎨 Ti-Guy Artiste (10 images/mois)',
        '🎬 Ti-Guy Studio (5 vidéos/mois)',
        '⚜️ Badge Bronze',
        'Pas de pubs',
      ],
      color: 'from-orange-600 to-orange-800',
      popular: false,
    },
    {
      id: 'silver' as const,
      name: 'Argent',
      price: 9.99,
      features: [
        'Tout Bronze +',
        '🎨 50 images AI/mois',
        '🎬 20 vidéos AI/mois',
        '💎 Badge Argent',
        '📊 Analytics avancés',
        '🔥 Boost de visibilité',
      ],
      color: 'from-gray-400 to-gray-600',
      popular: true,
    },
    {
      id: 'gold' as const,
      name: 'Or',
      price: 19.99,
      features: [
        'Tout Argent +',
        '🎨 Images AI illimitées',
        '🎬 Vidéos AI illimitées',
        '👑 Badge Or',
        '🚀 Priorité dans le feed',
        '🎁 500 cennes/mois',
        '💼 Outils créateurs pro',
      ],
      color: 'from-yellow-400 to-yellow-600',
      popular: false,
    },
  ];

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free' || tier === currentTier) return;
    
    try {
      await subscribeToPremium(tier);
      // After successful payment, user will be redirected back
    } catch (error: any) {
      console.error('Subscription error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Zyeuté <span className="text-gold-500">VIP</span>
          </h1>
          <p className="text-white/60 text-lg">
            Débloque tout le potentiel de l'IA québécoise
          </p>
          {currentTier !== 'free' && (
            <div className="mt-4 inline-block px-6 py-2 bg-gold-500/20 border border-gold-500 rounded-full">
              <span className="text-gold-500 font-bold">
                Abonnement actuel: {currentTier.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white/5 border ${
                tier.popular ? 'border-gold-500' : 'border-white/10'
              } rounded-2xl p-6 hover:bg-white/10 transition-all ${
                currentTier === tier.id ? 'ring-2 ring-gold-500' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-500 rounded-full text-xs font-bold text-black">
                  POPULAIRE
                </div>
              )}

              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                {tier.id === 'free' && '🆓'}
                {tier.id === 'bronze' && '🥉'}
                {tier.id === 'silver' && '🥈'}
                {tier.id === 'gold' && '🥇'}
              </div>

              <h3 className="text-2xl font-bold text-white text-center mb-2">
                {tier.name}
              </h3>

              <div className="text-center mb-6">
                {tier.price === 0 ? (
                  <span className="text-3xl font-bold text-white">Gratuit</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    <span className="text-white/60">/mois</span>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white/80 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(tier.id)}
                disabled={currentTier === tier.id}
                className={`w-full ${
                  tier.popular
                    ? 'bg-gradient-to-r from-gold-500 to-yellow-600'
                    : 'bg-white/10'
                }`}
              >
                {currentTier === tier.id ? 'Actif' : tier.id === 'free' ? 'Actuel' : 'S\'abonner'}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Questions fréquentes</h2>
          <div className="space-y-4">
            <details className="bg-white/5 border border-white/10 rounded-xl p-4">
              <summary className="font-bold text-white cursor-pointer">
                Puis-je annuler à tout moment?
              </summary>
              <p className="text-white/60 mt-2">
                Oui! Annule ton abonnement quand tu veux. Tu gardes l'accès jusqu'à la fin de ta période payée.
              </p>
            </details>
            <details className="bg-white/5 border border-white/10 rounded-xl p-4">
              <summary className="font-bold text-white cursor-pointer">
                Comment fonctionne le paiement?
              </summary>
              <p className="text-white/60 mt-2">
                Paiement sécurisé via Stripe. Cartes de crédit, débit, et Apple/Google Pay acceptés.
              </p>
            </details>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

