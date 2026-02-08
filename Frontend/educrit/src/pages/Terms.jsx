import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 px-6 py-10 sm:px-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Terms & Conditions
          </h1>
          <p className="text-blue-100 text-sm font-medium inline-block bg-blue-700/50 px-3 py-1 rounded-full border border-blue-500/30">
            Effective Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content Section */}
        <div className="px-6 py-10 sm:px-10 space-y-8">
          {/* Intro */}
          <div className="prose max-w-none text-gray-600 leading-relaxed border-b border-gray-100 pb-8">
            <p className="text-lg">
              Welcome to{" "}
              <span className="font-bold text-blue-600">EduCrit</span>. By
              accessing or using our platform, you agree to comply with and be
              bound by the following Terms and Conditions. If you do not agree
              with any part of these terms, please do not use the platform.
            </p>
          </div>

          {/* Sections Wrapper */}
          <div className="space-y-8 text-gray-700">
            <Section title="1. Platform Purpose">
              EduCrit is a peer-to-peer platform that enables users to list,
              buy, sell, or rent educational items. EduCrit does not own, sell,
              inspect, or verify any items listed on the platform.
            </Section>

            <Section title="2. User Responsibility">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Users are responsible for the accuracy of the information they
                  provide.
                </li>
                <li>Users must ensure they legally own the items they list.</li>
                <li>
                  All interactions and transactions are solely between users.
                </li>
              </ul>
            </Section>

            <Section title="3. Limitation of Liability">
              EduCrit shall not be held responsible for any loss, damage,
              dispute, fraud, or inconvenience arising from transactions or
              communications between users.
            </Section>

            <Section title="4. User Conduct">
              <p className="mb-2">Users agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Post misleading, false, or illegal content.</li>
                <li>Harass or abuse other users.</li>
                <li>Attempt to exploit or disrupt the platform.</li>
              </ul>
            </Section>

            <Section title="5. Account Termination">
              EduCrit reserves the right to suspend or permanently delete
              accounts that violate these Terms without prior notice.
            </Section>

            <Section title="6. Data Usage">
              Personal data is handled according to our Privacy Policy. EduCrit
              does not sell personal data to third parties.
            </Section>

            <Section title="7. Modifications">
              EduCrit may update these Terms at any time. Continued use of the
              platform constitutes acceptance of the revised terms.
            </Section>

            <Section title="8. Governing Law">
              These Terms are governed by the laws of India.
            </Section>

            {/* Contact Section (Distinct Style) */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                9. Contact Us
              </h2>
              <p className="text-gray-600 mb-1">
                If you have any questions regarding these Terms, please contact
                us at:
              </p>
              <a
                href="mailto:educrit.app@gmail.com"
                className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
              >
                educrit.app@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} EduCrit. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper Component to keep code clean
const Section = ({ title, children }) => (
  <section>
    <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
      {title}
    </h2>
    <div className="text-gray-600 leading-relaxed pl-4">{children}</div>
  </section>
);

export default Terms;
