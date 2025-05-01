// app/privacy-policy/page.tsx
import styles from './privacy-policy.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: May 1, 2025</p>

        <section className={styles.section}>
          <p>
            At AudioCloud, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you visit our website or use our services. Please read this privacy policy 
            carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Website includes:
          </p>

          <h3>Personal Data</h3>
          <p>
            When you register for an account, we collect personally identifiable information, such as your:
          </p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Username and password</li>
            <li>Payment information (if you subscribe to a paid plan)</li>
          </ul>

          <h3>Usage Data</h3>
          <p>
            We automatically collect certain information when you visit, use, or navigate the Website. This information 
            may include:
          </p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Pages visited</li>
            <li>Access times and dates</li>
            <li>Referring website address</li>
          </ul>

          <h3>Audio Files and Metadata</h3>
          <p>
            When you upload audio files to our service, we collect:
          </p>
          <ul>
            <li>The audio file itself</li>
            <li>Any metadata contained within the file</li>
            <li>Information about the file (size, format, duration, etc.)</li>
            <li>Any tags or descriptions you add</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>How We Use Your Information</h2>
          <p>We may use the information we collect from you for various purposes, including:</p>
          <ul>
            <li>Providing, operating, and maintaining our services</li>
            <li>Improving, personalizing, and expanding our services</li>
            <li>Understanding and analyzing how you use our services</li>
            <li>Developing new products, services, features, and functionality</li>
            <li>Communicating with you, including for customer service</li>
            <li>Sending emails and updates</li>
            <li>Finding and preventing fraud</li>
            <li>For compliance purposes, including enforcing our Terms of Service</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>

          <h3>By Law or to Protect Rights</h3>
          <p>
            If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy 
            potential violations of our policies, or to protect the rights, property, and safety of others, we may share your 
            information as permitted or required by any applicable law, rule, or regulation.
          </p>

          <h3>Third-Party Service Providers</h3>
          <p>
            We may share your information with third parties that perform services for us or on our behalf, including 
            payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>

          <h3>Marketing Communications</h3>
          <p>
            With your consent, or with an opportunity for you to withdraw consent, we may share your information with third 
            parties for marketing purposes.
          </p>

          <h3>Online Advertising</h3>
          <p>
            We use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. 
            These companies may use information (not including your name, address, email address, or telephone number) 
            about your visits to this and other websites to provide advertisements about products and services of interest to you.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information from 
            unauthorized access and use. While we have taken reasonable steps to secure the personal information you provide to us, 
            please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data 
            transmission can be guaranteed against any interception or other type of misuse.
          </p>
          <p>
            Any information disclosed online is vulnerable to interception and misuse by unauthorized parties. Therefore, 
            we cannot guarantee complete security if you provide personal information via our service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Audio File Security</h2>
          <p>
            We take specific measures to protect your audio files:
          </p>
          <ul>
            <li>
              <strong>Encryption</strong>: All audio files are encrypted during transit and storage.
            </li>
            <li>
              <strong>Access Controls</strong>: Only you and users you explicitly authorize can access your audio files.
            </li>
            <li>
              <strong>Hosting Security</strong>: Files are stored in secure cloud facilities with industry-standard protection.
            </li>
            <li>
              <strong>Regular Security Audits</strong>: We conduct security audits to ensure the integrity of our storage systems.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Policy for Children</h2>
          <p>
            We do not knowingly collect or market to children under the age of 13. If you are under 13, please do not use 
            the Website or provide any personal information to us. In the event that we learn that we have collected personal 
            information from a child under age 13, we will delete that information as quickly as possible. If you believe 
            that we might have any information from a child under 13, please contact us.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Your Consent</h2>
          <p>
            By using our service, you consent to our privacy policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Cookies</h2>
          <p>
            We use cookies to help personalize your online experience. A cookie is a text file that is placed on your hard disk 
            by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely 
            assigned to you, and can only be read by a web server in the domain that issued the cookie to you.
          </p>
          <p>
            We may use cookies to collect, store, and track information for statistical purposes to operate our Website. 
            You have the ability to accept or decline cookies. Most web browsers automatically accept cookies, but you can 
            usually modify your browser setting to decline cookies if you prefer.
          </p>
          <p>
            The types of cookies we use include:
          </p>
          <ul>
            <li>
              <strong>Essential cookies</strong>: These cookies are necessary for the website to function and cannot be switched 
              off in our systems. They are usually only set in response to actions made by you which amount to a request for 
              services, such as logging in or filling in forms.
            </li>
            <li>
              <strong>Analytics cookies</strong>: These help us count visits and traffic sources so we can measure and improve 
              the performance of our site. They help us know which pages are the most and least popular.
            </li>
            <li>
              <strong>Advertising cookies</strong>: These cookies may be set through our site by our advertising partners. 
              They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Third-Party Privacy Policies</h2>
          <p>
            AudioCloud’s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult 
            the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their 
            practices and instructions about how to opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. More detailed information about 
            cookie management with specific web browsers can be found at the browsers’ respective websites.
          </p>
        </section>

        <section className={styles.section}>
          <h2>GDPR Privacy Policy (Data Protection Rights)</h2>
          <p>
            If you are within the European Union, you are entitled to certain information and have certain rights under the 
            General Data Protection Regulation. These rights include:
          </p>
          <ul>
            <li>
              <strong>Right to access</strong> – You have the right to request copies of your personal data.
            </li>
            <li>
              <strong>Right to rectification</strong> – You have the right to request that we correct any information you believe 
              is inaccurate. You also have the right to request that we complete information you believe is incomplete.
            </li>
            <li>
              <strong>Right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.
            </li>
            <li>
              <strong>Right to restrict processing</strong> – You have the right to request that we restrict the processing of your 
              personal data, under certain conditions.
            </li>
            <li>
              <strong>Right to object to processing</strong> – You have the right to object to our processing of your personal data, 
              under certain conditions.
            </li>
            <li>
              <strong>Right to data portability</strong> – You have the right to request that we transfer the data that we have 
              collected to another organization, or directly to you, under certain conditions.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>California Privacy Rights</h2>
          <p>
            California Civil Code Section 1798.83, also known as the “Shine The Light” law, permits our users who are California 
            residents to request and obtain from us, once a year and free of charge, information about categories of personal 
            information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all 
            third parties with which we shared personal information in the immediately preceding calendar year. If you are a 
            California resident and would like to make such a request, please submit your request in writing to us using our 
            contact information.
          </p>
          <p>
            If you are under 18 years of age, reside in California, and have a registered account with the Website, you have the 
            right to request removal of unwanted data that you publicly post on the Website. To request removal of such data, 
            please contact us using the contact information provided below, and include the email address associated with your 
            account and a statement that you reside in California. We will make sure the data is not publicly displayed on the 
            Website, but please be aware that the data may not be completely or comprehensively removed from our systems.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the “Last Updated” date at the top of this page. You are advised to 
            review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when 
            they are posted on this page.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className={styles.contactInfo}>
            <li>By email: support@audiocloud.com</li>
            <li>By visiting our contact page: <a href="/contact">Contact Us</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}