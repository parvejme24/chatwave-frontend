import { LegalDoc } from "./legal-doc"
import { LegalShell } from "./legal-shell"

export function TermsPage() {
  return (
    <LegalShell>
    <LegalDoc
      title="Terms of Service"
      updated="August 23, 2026"
      intro="These terms explain how you can use ChatWave. By creating an account or using the product, you agree to them. If you do not agree, do not use ChatWave."
      sections={[
        {
          title: "The service",
          paragraphs: [
            "ChatWave is a messaging product for text, voice notes, video messages, and calls that stay in sync across your devices. Features may change as we ship updates.",
            "We may add, pause, or remove parts of the service. We will try to keep the product available, but we do not promise uninterrupted access.",
          ],
        },
        {
          title: "Your account",
          paragraphs: [
            "You need an account to use ChatWave. You can sign up with your name, email, and password.",
            "You must provide accurate details, keep your password to yourself, and tell us if you think someone else has used your account. You are responsible for activity that happens under your login.",
            "You must be at least 13 years old. If you use ChatWave for a company, you confirm you have authority to accept these terms for that company.",
          ],
        },
        {
          title: "Acceptable use",
          paragraphs: [
            "Use ChatWave for real conversations. Do not use it to harm people, break the law, or interfere with the product.",
          ],
          bullets: [
            "Do not spam, phish, or send malware.",
            "Do not harass, threaten, or impersonate others.",
            "Do not try to access another person's account, messages, or devices.",
            "Do not scrape, overload, or reverse engineer the service except as allowed by law.",
            "Do not use ChatWave to share content you do not have the right to share.",
          ],
        },
        {
          title: "Your content",
          paragraphs: [
            "You keep the rights to the messages, voice notes, and other content you send. You give ChatWave a limited license to store, transmit, and display that content so we can deliver it, sync it across your devices, and operate the product.",
            "You are responsible for what you send. We may remove content or suspend an account if it breaks these terms or the law.",
          ],
        },
        {
          title: "Calls and encryption",
          paragraphs: [
            "Voice and video calls may use peer-to-peer connections. Signaling still goes through our servers so we can connect the call. Encryption does not mean the service is risk-free. Protect your devices and sign-in details.",
          ],
        },
        {
          title: "Privacy",
          paragraphs: [
            "How we collect and use information is described in the Privacy Policy. Using ChatWave means you also accept that policy.",
          ],
        },
        {
          title: "Availability and changes",
          paragraphs: [
            "We may update these terms when the product or the law changes. The date at the top of this page is the latest version. If a change is material, we will try to let you know in the product or by email.",
            "Continued use after an update means you accept the new terms.",
          ],
        },
        {
          title: "Disclaimer",
          paragraphs: [
            "ChatWave is provided as is. To the fullest extent allowed by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that messages or calls will always be delivered, stored, or error-free.",
          ],
        },
        {
          title: "Limitation of liability",
          paragraphs: [
            "To the fullest extent allowed by law, ChatWave and its operators are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill, arising from your use of the service.",
            "If we are found liable, our total liability for any claim is limited to the amount you paid us in the 12 months before the claim, or fifty US dollars if you have not paid us.",
          ],
        },
        {
          title: "Termination",
          paragraphs: [
            "You can stop using ChatWave at any time. We may suspend or close an account if you break these terms, if we are required to by law, or if we shut down the service.",
            "After an account is closed, we may delete or anonymize content as described in the Privacy Policy, except where we must keep it.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Questions about these terms can be sent to legal@chatwave.app.",
          ],
        },
      ]}
    />
    </LegalShell>
  )
}
