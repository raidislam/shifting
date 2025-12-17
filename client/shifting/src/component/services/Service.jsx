
import { useNavigate } from "react-router";
import { data } from "../../data/servicesData";

export default function OurServices() {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Delivery System Services</h2>
        <p className="text-base-content/70 mt-2">
          Six core services to run your delivery operation smoothly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => navigate(s.path)}
              className="card bg-base-100 shadow hover:shadow-lg transition text-left"
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="btn btn-circle btn-ghost">
                    <Icon className="text-2xl" />
                  </div>

                  <div>
                    <h3 className="card-title">{s.title}</h3>
                    <p className="text-base-content/70">{s.desc}</p>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <span className="btn btn-sm btn-primary">View Details</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
