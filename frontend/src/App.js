import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Inspiration from "./pages/Inspiration";
import Kit from "./pages/Kit";
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

function App() {
  return (
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
                <Route path="/kit" element={<Kit />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              </Routes>
              <Footer />
              <CookieBanner />
            </>
          } />
          
          {/* Routes admin sans Header/Footer */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/cms" element={<CMS />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;