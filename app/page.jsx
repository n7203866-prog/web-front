import Hero from '@/components/Hero/Hero';
import AboutUs from '@/components/AboutUs/AboutUs';
import SuccessfulStories from '@/components/SuccessfulStories';
import WhatWeOffer from '@/components/WhatWeOffer/WhatWeOffer';
import MeetOurTeam from '@/components/MeetOurTeam';
import ContactSection from '@/components/ContactSection/ContactSection';
import Partinars from '@/components/Partinars/Partinars';
import FeaturedBlogPreview from '@/components/FeaturedBlogPreview';
import Clients from './../components/Client/Clients';

export default function Home() {
  return <>
    <Hero />
    <AboutUs />
    <FeaturedBlogPreview />
    <Partinars />
    {/* <Clients /> */}
    <SuccessfulStories />
    <WhatWeOffer />
    <MeetOurTeam />
    <ContactSection />
  </>
    ;
}

