"use client";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { ClientInit } from "@/components/ClientInit";
import Chat from "@/components/chat/Chat";



export default function Layout({ children }) {
  
  return (
    <html lang="en">
       <head>
        {/* Material Symbols pour les icônes */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
          rel="stylesheet"
        />
      </head>
      <body>
        <Banner />
        <StoreProvider>
          <ClientInit>
            <Navbar />
             <Toaster />
          {children}
          </ClientInit>
          <Chat/>
        </StoreProvider>
        <Footer />
      </body>
    </html>
  );
}
