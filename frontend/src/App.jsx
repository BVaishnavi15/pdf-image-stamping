//App.jsx
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import EditorSection from "./components/EditorSection";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <EditorSection />
      <Footer />
    </div>
  );
}
