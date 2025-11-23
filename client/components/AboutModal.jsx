import React, { useState } from 'react';
import { X, Sparkles, Heart, Leaf, Award } from 'lucide-react';
import Link from 'next/link';

const AboutModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Trigger Link - Use this instead of your existing Link */}
      <button 
        onClick={openModal}
        className="hover:text-gray-900 transition cursor-pointer"
      >
        À propos
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 animate-modal-enter overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
            </button>

            {/* Header Section */}
            <div className="relative bg-green-700 px-6 py-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12" />
              
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                  <h2 className="text-2xl font-bold">glamour.</h2>
                </div>
                <p className="text-lg text-green-100 font-light">Affichez votre style unique</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-6">
              <div className="mb-6">
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                 Nous nous engageons à proposer des baskets et chaussures de sport de qualité supérieure, alliant confort, style et durabilité pour hommes et femmes.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Feature 1 */}
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-300">
                      <Leaf className="w-6 h-6 text-green-700" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">100% Confort</h3>
                    <p className="text-gray-600 text-xs">Chaussures soigneusement conçues pour votre bien-être</p>
                  </div>

                  {/* Feature 2 */}
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-300">
                      <Award className="w-6 h-6 text-green-700" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Style Premium</h3>
                    <p className="text-gray-600 text-xs">Designs élégants et tendances, pour toutes vos occasions</p>
                  </div>

                  {/* Feature 3 */}
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-300">
                      <Heart className="w-6 h-6 text-green-700" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 text-sm">Avec Passion</h3>
                    <p className="text-gray-600 text-xs">Créées avec expertise et amour pour le sport et la mode</p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-700 mb-1">300+</div>
                    <div className="text-xs text-gray-600">Clients satisfaits</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-700 mb-1">100+</div>
                    <div className="text-xs text-gray-600">Produits</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-700 mb-1">4★</div>
                    <div className="text-xs text-gray-600">Note moyenne</div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
               <Link href='/shop'><button 
                  
                  className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl text-sm"
                >
                  Découvrir nos produits
                </button></Link> 
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AboutModal;