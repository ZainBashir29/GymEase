import Navbar from "../Layout/Navbar.jsx";
import Footer from "../Layout/Footer.jsx";
import Hero from "./Hero.jsx";
import Services from "./Services.jsx";
import CtaBanner from "./CtaBanner.jsx";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
