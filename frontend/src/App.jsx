import React, { useEffect } from 'react'
import Navbar from './components/landing/Navbar'
import Hero from './components/landing/Hero'
import Overview from './components/landing/Overview'
import Features from './components/landing/Features'
import TechStack from './components/landing/TechStack'
import Audience from './components/landing/Audience'
import Contact from './components/landing/Contact'
import Footer from './components/landing/Footer'

export default function App() {
  // Global scroll-reveal observer
  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll')
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        }),
      { threshold: 0.1 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Overview />
      <Features />
      <TechStack />
      <Audience />
      <Contact />
      <Footer />
    </div>
  )
}