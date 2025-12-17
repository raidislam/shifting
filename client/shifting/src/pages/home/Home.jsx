import React from 'react'
import Banner from '../../component/Banner/Banner'
import OurServices from '../../component/services/Service'
import BrandSlider from '../../component/brandSlider/BrandSlider'
import Benifits from '../../component/benifits/Benifits'
import MercentBanner from '../../component/Banner/MercentBanner'

export default function Home() {
  return (
    <>
        <Banner/>
        <OurServices/>
        <BrandSlider/>
        <Benifits/>
        <MercentBanner/>
    </>
  )
}
