import HeadLine from "./landing/headline";
import HowHearHearWorks from "./landing/how";
import Features from "./landing/features";
import Contact from "./landing/contact";
import Footer from "./landing/footer";

export default function LandingPage() {
  return (
    <div className="bg-black">
      <HeadLine />
      <HowHearHearWorks />
      <Features />
      <Contact />
      <Footer />
    </div>
  );
}
