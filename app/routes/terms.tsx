import type { V2_MetaFunction } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [{ title: `Terms and Conditions` }];
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        Terms and Conditions
      </h1>
      <p className="text-gray-700 mb-4 leading-7">
        Please read these terms and conditions carefully before using our
        website operated by HearHear. Your access to and use of the website is
        conditioned on your acceptance of and compliance with these terms. These
        terms apply to all visitors, users, and others who access or use the
        website.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Accounts</h2>
      <p className="text-gray-700 mb-4 leading-7">
        When you create an account with us, you must provide accurate, complete,
        and up-to-date information. Failure to do so constitutes a breach of the
        terms, which may result in immediate termination of your account on our
        website.
      </p>
      <p className="text-gray-700 mb-4 leading-7">
        You are responsible for safeguarding the password that you use to access
        the website and for any activities or actions under your password,
        whether your password is with our website or a third-party service.
      </p>
      <p className="text-gray-700 mb-4 leading-7">
        You agree not to disclose your password to any third party. You must
        notify us immediately upon becoming aware of any breach of security or
        unauthorized use of your account.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Intellectual Property
      </h2>
      <p className="text-gray-700 mb-4 leading-7">
        The website and its original content, features, and functionality are
        owned by HearHear and are protected by international copyright,
        trademark, patent, trade secret, and other intellectual property or
        proprietary rights laws.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Links To Other Web Sites
      </h2>
      <p className="text-gray-700 mb-4 leading-7">
        Our website may contain links to third-party web sites or services that
        are not owned or controlled by HearHear. We have no control over, and
        assume no responsibility for, the content, privacy policies, or
        practices of any third party web sites or services. You further
        acknowledge and agree that HearHear shall not be responsible or liable,
        directly or indirectly, for any damage or loss caused or alleged to be
        caused by or in connection with use of or reliance on any such content,
        goods or services available on or through any such web sites or
        services.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Termination and Suspension
      </h2>
      <p className="text-gray-700 mb-4 leading-7">
        We may terminate or suspend access to our website immediately, without
        prior notice or liability, for any reason whatsoever, including without
        limitation if you breach the terms. All provisions of the terms which by
        their nature should survive termination shall survive termination,
        including, without limitation, ownership provisions, warranty
        disclaimers, indemnity and limitations of liability.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Indemnification</h2>
      <p className="text-gray-700 mb-4 leading-7">
        You agree to defend, indemnify and hold harmless HearHear and its
        licensee and licensors, and their employees, contractors, agents,
        officers and directors, from and against any and all claims, damages,
        obligations, losses, liabilities, costs or debt, and expenses (including
        but not limited to attorney's fees), resulting from or arising out of a)
        your use and access of the website, by you or any person using your
        account and password, or b) a breach of these terms.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Limitation Of Liability
      </h2>
      <p className="text-gray-700 mb-4 leading-7">
        In no event shall HearHear, nor its directors, employees, partners,
        agents, suppliers, or affiliates, be liable for any indirect,
        incidental, special, consequential or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other
        intangible losses, resulting from (i) your access to or use of or
        inability to access or use the website; (ii) any conduct or content of
        any third party on the website; (iii) any content obtained from the
        website; and (iv) unauthorized access, use or alteration of your
        transmissions or content, whether based on warranty, contract, tort
        (including negligence) or any other legal theory, whether or not we have
        been informed of the possibility of such damage, and even if a remedy
        set forth herein is found to have failed of its essential purpose.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Disclaimer</h2>
      <p className="text-gray-700 mb-4 leading-7">
        Your use of the website is at your sole risk. The website is provided on
        an "AS IS" and "AS AVAILABLE" basis. The website is provided without
        warranties of any kind, whether express or implied, including, but not
        limited to, implied warranties of merchantability, fitness for a
        particular purpose, non-infringement or course of performance.
      </p>
      <p className="text-gray-700 mb-4 leading-7">
        HearHear its subsidiaries, affiliates, and its licensors do not warrant
        that a) the website will function uninterrupted, secure or available at
        any particular time or location; b) any errors or defects will be
        corrected; c) the website is free of viruses or other harmful
        components; or d) the results of using the website will meet your
        requirements.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Governing Law</h2>
      <p className="text-gray-700 mb-4 leading-7">
        These terms shall be governed and construed in accordance with the laws
        of the Netherlands, without regard to its conflict of law provisions.
      </p>
      <p className="text-gray-700 mb-4 leading-7">
        Our failure to enforce any right or provision of these terms will not be
        considered a waiver of those rights. If any provision of these terms is
        held to be invalid or unenforceable by a court, the remaining provisions
        of these terms will remain in effect. These terms constitute the entire
        agreement between us regarding our website, and supersede and replace
        any prior agreements we might have between us regarding the website.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Changes</h2>
      <p className="text-gray-700 mb-4 leading-7">
        We reserve the right, at our sole discretion, to modify or replace these
        terms at any time. If a revision is material we will try to provide at
        least 30 days notice prior to any new terms taking effect. What
        constitutes a material change will be determined at our sole discretion.
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
      <p className="text-gray-700 mb-4 leading-7">
        If you have any questions about these terms, please contact us.
      </p>
    </div>
  );
}
