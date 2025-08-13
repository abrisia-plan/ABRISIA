import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Inspiration from "./pages/Inspiration";
import Devis from "./pages/Devis";
import Contact from "./pages/Contact";
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Routes publiques avec Header et Footer */}
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inspiration" element={<Inspiration />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
              <Footer />
            </>
          } />
          
          {/* Routes admin sans Header/Footer */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;