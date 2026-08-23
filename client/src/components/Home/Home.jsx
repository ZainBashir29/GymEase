import Hero from "./Hero.jsx";
import Services from "./Services.jsx";
import CtaBanner from "./CtaBanner.jsx";

const Home = () => {
  return (
    <div className="bg-white">
      <Hero />
      <Services />
      <CtaBanner />
    </div>
  );
};

export default Home;
