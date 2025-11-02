'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, Shield, MapPin, TrendingUp } from 'lucide-react'
import { BackgroundVectors } from '@/components/background-vectors'
import { motion } from 'framer-motion'

type HomePageContent = {
  key: string
  title?: string | null
  content: string
}

export default function HomePage() {
  const [content, setContent] = useState<Record<string, HomePageContent>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/homepage')
      .then((res) => res.json())
      .then((data) => {
        setContent(data)
      })
      .catch((err) => {
        console.error('Error loading homepage content:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const getContent = (key: string, defaultValue: string) => {
    return content[key]?.content || defaultValue
  }
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <BackgroundVectors />
      
      <div className="relative z-10">
        {/* Navigation - Mobile Optimized */}
        <nav className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <span className="text-xl md:text-2xl font-bold text-gray-900">FireResponse</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link
                href="/login"
                className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-700 hover:text-red-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/track"
                className="hidden md:inline px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                Track Report
              </Link>
              <Link
                href="/report"
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                Report Fire
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section - Mobile Optimized */}
        <section className="container mx-auto px-4 py-12 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6">
              Quick Fire Response
              <span className="text-red-600 block">System</span>
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 px-4">
              Report fire incidents instantly. Help save lives and property with real-time emergency response.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link
                href="/report"
                className="px-6 md:px-8 py-3 md:py-4 bg-red-600 text-white text-base md:text-lg rounded-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Report Fire Incident
              </Link>
              <Link
                href="/track"
                className="px-6 md:px-8 py-3 md:py-4 bg-white text-red-600 text-base md:text-lg rounded-lg hover:bg-gray-50 transition-all shadow-xl border-2 border-red-600"
              >
                Track Report
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features - Mobile Optimized */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<MapPin className="w-12 h-12" />}
              title={getContent('feature1Title', 'GPS Location')}
              description={getContent('feature1Description', 'Automatic location detection for faster response times')}
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title={getContent('feature2Title', 'Secure & Reliable')}
              description={getContent('feature2Description', 'Your data is protected with industry-standard security')}
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title={getContent('feature3Title', 'Real-time Updates')}
              description={getContent('feature3Description', 'Track your report status in real-time')}
            />
          </div>
        </section>

        {/* Emergency Hotline - Mobile Optimized */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-red-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-center text-white shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Emergency Hotline</h2>
            <a
              href="tel:911"
              className="text-3xl md:text-4xl lg:text-5xl font-bold hover:text-red-200 transition-colors block"
            >
              911
            </a>
            <p className="mt-3 md:mt-4 text-base md:text-xl">Call immediately for life-threatening emergencies</p>
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
