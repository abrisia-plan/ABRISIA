import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import ChatBot from "./components/ChatBot";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Inspiration from "./pages/Inspiration";
import Kit from "./pages/Kit";
import Collection from "./pages/Collection";
import Devis from "./pages/Devis";
import Feedback from "./pages/Feedback";
import Contact from "./pages/Contact";
import About from "./pages/About";
import MentionsLegales from "./pages/Legal/MentionsLegales";
import PolitiqueConfidentialite from "./pages/Legal/PolitiqueConfidentialite";
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import CMS from "./pages/Admin/CMS";
import AdminPanel from "./pages/Admin/AdminPanel";
import { EmployeePortal } from "./pages/EmployeePortal";
import Temoignage from "./pages/Temoignage";

function App() {
  return (
    <HelmetProvider>
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Routes publiques avec Header et Footer */}
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inspiration" element={<Inspiration />} />
                <Route path="/kit" element={<Navigate to="/collection" replace />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              </Routes>
              <Footer />
              <CookieBanner />
              <ChatBot />
            </>
          } />
          
          {/* Routes admin sans Header/Footer */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/panel" replace />} />
          <Route path="/admin/cms" element={<CMS />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/temoignage" element={<Temoignage />} />
          
          {/* Routes espace employé */}
          <Route path="/connexion-employe" element={<Navigate to="/admin" replace />} />
          <Route path="/espace-employe" element={<EmployeePortal />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
    </HelmetProvider>
  );
}

export default App;