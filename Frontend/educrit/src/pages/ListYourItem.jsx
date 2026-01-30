import { Link } from "react-router-dom";

const ListYourItem = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* HERO SECTION */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          List your item on <span className="text-blue-600">EduCrit</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Help fellow students by selling or renting items you no longer need —
          books, lab equipment, projects, and more.
        </p>
      </div>

      {/* STEPS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
        <div className="p-6 border rounded-xl text-center shadow-sm">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="font-semibold text-lg mb-2">Create an account</h3>
          <p className="text-sm text-gray-600">
            Sign up using your email and verify your account.
          </p>
        </div>

        <div className="p-6 border rounded-xl text-center shadow-sm">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-semibold text-lg mb-2">Add item details</h3>
          <p className="text-sm text-gray-600">
            Upload images, set price, choose sell or rent.
          </p>
        </div>

        <div className="p-6 border rounded-xl text-center shadow-sm">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-semibold text-lg mb-2">Get contacted</h3>
          <p className="text-sm text-gray-600">
            Buyers contact you via email or WhatsApp.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
        >
          Get Started
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ListYourItem;
