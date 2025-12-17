import React from 'react'
import { Outlet } from 'react-router'
import Header from '../component/header/Header'
import Footer from '../component/footer/Footer'

export default function RootLayout() {
    return (
        <>
            <Header />
            <main className='container mx-auto'>
                <Outlet></Outlet>
            </main>
            <Footer />
        </>
    )
}
