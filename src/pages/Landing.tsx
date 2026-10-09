import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Heart } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">FoodBridge AI</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-emerald-700 font-medium">Log In</Link>
          <Link to="/signup" className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700">Sign Up</Link>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 px-6 md:px-12 text-center bg-emerald-50">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Connecting Surplus Food to <span className="text-emerald-600">Communities in Need</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            FoodBridge AI uses climate-aware routing and smart allocation to ensure perishable food reaches those who need it most, safely and efficiently.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 flex items-center">
              Join the Network <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
        
        <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Climate-Aware</h3>
            <p className="text-gray-600">Simulates and adapts to weather disruptions to ensure safe food delivery.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Allocation</h3>
            <p className="text-gray-600">AI-driven matching ensures nutritional needs are met efficiently.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Impact</h3>
            <p className="text-gray-600">Track your contributions and see the real-world impact of your donations.</p>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-gray-400 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} FoodBridge AI. Supporting SDG 2: Zero Hunger.</p>
      </footer>
    </div>
  );
}
