import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import LaCarte from './pages/LaCarte'
import NotreHistoire from './pages/NotreHistoire'
import Galerie from './pages/Galerie'
import Contact from './pages/Contact'
import Reservation from './pages/Reservation'
import MentionsLegales from './pages/MentionsLegales'
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite'
import GestionCookies from './pages/GestionCookies'
import Accessibilite from './pages/Accessibilite'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="la-carte" element={<LaCarte />} />
        <Route path="notre-histoire" element={<NotreHistoire />} />
        <Route path="galerie" element={<Galerie />} />
        <Route path="contact" element={<Contact />} />
        <Route path="reservation" element={<Reservation />} />
        <Route path="mentions-legales" element={<MentionsLegales />} />
        <Route path="politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="gestion-des-cookies" element={<GestionCookies />} />
        <Route path="accessibilite" element={<Accessibilite />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
