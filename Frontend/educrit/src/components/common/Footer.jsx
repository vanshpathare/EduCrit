import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t mt-10 py-4 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} EduCrit. All rights reserved.</p>

      <div className="mt-2 space-x-4">
        <Link to="/terms" className="hover:text-gray-700">
          Terms
        </Link>
        <Link to="/privacy" className="hover:text-gray-700">
          Privacy
        </Link>
        <Link to="/contact" className="hover:text-gray-700">
          Contact
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
