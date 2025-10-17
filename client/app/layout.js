"use client";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ClientInit } from "@/components/ClientInit";



export default function Layout({ children }) {
  
  return (
    <html lang="en">
      <body>
        <Banner />
        <StoreProvider>
          <ClientInit>
            <Navbar />
             <Toaster />
          {children}
          </ClientInit>
        </StoreProvider>
        <Footer />
      </body>
    </html>
  );
}
