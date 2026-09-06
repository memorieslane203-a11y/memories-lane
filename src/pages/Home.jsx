import Hero from '../components/home/Hero'
import OccasionCollections from '../components/home/OccasionCollections'
import FeaturedCategories from '../components/home/FeaturedCategories'
import Bestsellers from '../components/home/Bestsellers'
import SurpriseMe from '../components/home/SurpriseMe'
import HowItWorks from '../components/home/HowItWorks'
import Newsletter from '../components/home/Newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <OccasionCollections />
      <FeaturedCategories />
      <Bestsellers />
      <SurpriseMe />
      <HowItWorks />
      <Newsletter />
    </>
  )
}
