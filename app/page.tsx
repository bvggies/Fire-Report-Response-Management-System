'use client'

import Link from 'next/link'
import { Flame, Shield, MapPin, TrendingUp } from 'lucide-react'
import { BackgroundVectors } from '@/components/background-vectors'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <BackgroundVectors />
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">FireResponse</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/track"
                className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                Track Report
              </Link>
              <Link
                href="/report"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                Report Fire
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Quick Fire Response
              <span className="text-red-600 block">System</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Report fire incidents instantly. Help save lives and property with real-time emergency response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/report"
                className="px-8 py-4 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Report Fire Incident
              </Link>
              <Link
                href="/track"
                className="px-8 py-4 bg-white text-red-600 text-lg rounded-lg hover:bg-gray-50 transition-all shadow-xl border-2 border-red-600"
              >
                Track Report
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<MapPin className="w-12 h-12" />}
              title="GPS Location"
              description="Automatic location detection for faster response times"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Secure & Reliable"
              description="Your data is protected with industry-standard security"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Real-time Updates"
              description="Track your report status in real-time"
            />
          </div>
        </section>

        {/* Emergency Hotline */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-red-600 rounded-2xl p-8 text-center text-white shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Emergency Hotline</h2>
            <a
              href="tel:911"
              className="text-4xl md:text-5xl font-bold hover:text-red-200 transition-colors"
            >
              911
            </a>
            <p className="mt-4 text-xl">Call immediately for life-threatening emergencies</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="text-red-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}
