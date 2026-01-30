const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

      <p className="text-sm text-gray-500 text-center mb-10">
        Effective Date: {new Date().toLocaleDateString()}
      </p>

      <p className="mb-6 text-gray-700 leading-relaxed">
        At <strong>EduCrit</strong>, your privacy is important to us. This
        Privacy Policy explains how we collect, use, and protect your
        information when you use our platform.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Name, email address, institution</li>
          <li>Profile details including avatar and WhatsApp number</li>
          <li>Item listings and related activity</li>
          <li>Technical data such as IP address and browser</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>To operate and improve EduCrit</li>
          <li>To enable communication between users</li>
          <li>To maintain security and prevent misuse</li>
          <li>To send important service notifications</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
        <p className="text-gray-700 leading-relaxed">
          We do not sell or rent your personal data. Information is only shared
          when required to provide platform functionality or comply with legal
          obligations.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
        <p className="text-gray-700 leading-relaxed">
          We take reasonable technical and organizational measures to protect
          your data from unauthorized access or misuse.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Contact</h2>
        <p className="text-gray-700">
          If you have any questions regarding this Privacy Policy, please
          contact us via the Contact page.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
