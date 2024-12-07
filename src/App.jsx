import { ToastContainer } from "react-toastify";
import "./App.css";
import AllStores from "./components/AllStores";
// import CommonQuestion  from './components/CommonQuestion'
import { Grocery } from "./components/Grocery";
// import Header from './components/Header'
import HeroSection from "./components/HeroSection";
import { MarketPlace } from "./components/MarketPlace";
import Stores from "./components/Stores";

function App() {
  return (
    <>
      {/* <Header /> */}
      <HeroSection />
      <Stores />
      <AllStores />
      <ToastContainer />
      <Grocery />
      <MarketPlace />
      {/* <CommonQuestion/> */}
    </>
  );
}

export default App;
