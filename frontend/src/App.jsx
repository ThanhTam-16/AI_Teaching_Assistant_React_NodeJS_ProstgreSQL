import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Overview from './components/Overview'
import Features from './components/Features'
import TechStack from './components/TechStack'
import Audience from './components/Audience'
import Contact from './components/Contact'
import Footer from './components/Footer'

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