const Contact = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>

      <p className="text-center text-gray-600 mb-10">
        We’d love to hear from you. Reach out to us using the details below.
      </p>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h2 className="font-semibold">📧 Email</h2>
          <p className="text-gray-700">support@educrit.com</p>
        </div>

        <div>
          <h2 className="font-semibold">⏱ Response Time</h2>
          <p className="text-gray-700">
            We usually respond within 24–48 hours.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">📍 Purpose</h2>
          <p className="text-gray-700">
            For queries related to listings, account issues, or general support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
