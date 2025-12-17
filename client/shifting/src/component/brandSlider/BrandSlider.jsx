import { brands } from "../../data/brand";
import "./brandSlider.css";

export default function BrandSlider() {
  return (
    <section className="py-14 bg-base-200 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-8">
          Trusted by Leading Brands
        </h2>

        <div className="relative w-full overflow-hidden">
          <div className="brand-track">
            {[...brands, ...brands].map((logo, i) => (
              <div key={i} className="brand-item">
                <img
                  src={logo}
                  alt="Brand logo"
                  className="h-10 w-auto opacity-70 hover:opacity-100 transition"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
