import { ToastContainer } from "react-toastify";
import "./App.css";
// import CommonQuestion  from './components/CommonQuestion'
import { Grocery } from "./components/Grocery";
// import Header from './components/Header'
import HeroSection from "./components/HeroSection";
import { MarketPlace } from "./components/MarketPlace";
import Stores from "./components/Stores";
import Results from "./components/Results";
import AllFunctions from "./components/AllFunctions";
import ReviewComp from "./components/ReviewComp";
import DisplayOptions from "./components/DisplayOptions";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      {/* <Header /> */}
      <HeroSection />
      <Stores />
      <Results />
      <AllFunctions />
      <ToastContainer />
      <Grocery />
      <ReviewComp />
      <DisplayOptions/>
      <MarketPlace />
      <Footer/>
      {/* <CommonQuestion/> */}
    </>
  );
}

export default App;
