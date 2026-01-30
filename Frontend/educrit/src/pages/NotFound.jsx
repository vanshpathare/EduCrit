import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg mb-6">Page not found</p>
      <Link to="/" className="px-4 py-2 bg-black text-white rounded">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
