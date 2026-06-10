import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import { AuthProvider } from "./lib/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterPet from "./pages/RegisterPet";
import LostPets from "./pages/LostPets";
import FoundPets from "./pages/FoundPets";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import ReportSighting from "./pages/ReportSighting";
import SearchPets from "./pages/SearchPets";
import MapView from "./pages/MapView";
import PetProfile from "./pages/PetProfile";
import LostDetail from "./pages/LostDetail";
import Dashboard from "./pages/Dashboard";
import VetRegister from "./pages/VetRegister";
import RescueRegister from "./pages/RescueRegister";
import Support from "./pages/Support";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/register-pet" element={<RegisterPet/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/lost-pets" element={<LostPets/>}/>
            <Route path="/found-pets" element={<FoundPets/>}/>
            <Route path="/report-lost" element={<ReportLost/>}/>
            <Route path="/report-found" element={<ReportFound/>}/>
            <Route path="/report-sighting/:lostId" element={<ReportSighting/>}/>
            <Route path="/search" element={<SearchPets/>}/>
            <Route path="/map" element={<MapView/>}/>
            <Route path="/p/:id" element={<PetProfile/>}/>
            <Route path="/lost/:id" element={<LostDetail/>}/>
            <Route path="/vet-register" element={<VetRegister/>}/>
            <Route path="/rescue-register" element={<RescueRegister/>}/>
            <Route path="/support" element={<Support/>}/>
            <Route path="/about" element={<About/>}/>
            <Route path="/contact" element={<Contact/>}/>
            <Route path="/privacy" element={<Privacy/>}/>
            <Route path="/terms" element={<Terms/>}/>
            <Route path="/subscribe" element={<Donate/>}/>
            <Route path="/donate" element={<Donate/>}/>
            <Route path="/admin" element={<Admin/>}/>
            <Route path="*" element={<div className="max-w-2xl mx-auto px-4 py-24 text-center"><h1 className="font-display font-bold text-3xl text-[var(--npw-primary)]">Not found</h1><p className="text-[var(--npw-muted)] mt-2">The page you're looking for doesn't exist.</p></div>}/>
          </Routes>
          <Toaster position="top-right"/>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
