import type { Metadata } from "next"

import { LegalDoc } from "@/components/legal/legal-doc"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ChatWave collects, uses, and shares information for messaging, voice notes, and calls.",
}

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="August 23, 2026"
      intro="This policy explains what information ChatWave collects, why we collect it, and the choices you have. It covers the web app and related services for messaging, voice notes, video messages, and calls."
      sections={[
        {
          title: "Who we are",
          paragraphs: [
            "ChatWave is the service that lets you send messages and join voice or video calls across your devices. If you have questions about this policy, write to privacy@chatwave.app.",
          ],
        },
        {
          title: "Information we collect",
          paragraphs: [
            "We collect the information needed to run your account and deliver conversations.",
          ],
          bullets: [
            "Account details: name, email address, and a hashed password if you sign up with email.",
            "Sign-in from Google or GitHub: the name, email, and profile identifiers those services share with us.",
            "Messages and media you send, so we can deliver them and keep them in sync.",
            "Call signaling data used to connect a call, such as when a call starts or ends.",
            "Device and usage data: browser type, app version, approximate region, and product events that help us keep the service reliable.",
            "Support messages if you contact us.",
          ],
        },
        {
          title: "How we use information",
          paragraphs: ["We use this information to:"],
          bullets: [
            "Create and secure your account, including password resets with a one-time code.",
            "Deliver messages, voice notes, and calls, and sync them across your devices.",
            "Prevent abuse, debug outages, and improve the product.",
            "Send email that is about your account, such as a reset code. We do not send marketing mail unless you ask for it.",
            "Meet legal obligations if we are required to.",
          ],
        },
        {
          title: "Messages and calls",
          paragraphs: [
            "Message content is stored so it can reach the people you send it to and appear on your other devices. Do not send information in ChatWave that you would not want stored with a messaging service.",
            "Calls may connect peer-to-peer. We still process signaling so the call can start. We do not use the contents of your messages or calls to advertise to you.",
          ],
        },
        {
          title: "How we share information",
          paragraphs: [
            "We do not sell your personal information. We share it only when we need to operate the product or when the law requires it.",
          ],
          bullets: [
            "With people you message or call. They see the content you send them.",
            "With infrastructure providers that host the app, send email, or keep the service online. They may process data only on our instructions.",
            "With Google or GitHub when you choose those sign-in options.",
            "If we are legally required to disclose information, or to protect people from serious harm.",
            "If ChatWave is transferred as part of a merger or sale, your information may move with the product under this policy or a successor policy.",
          ],
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "We use cookies and similar storage to keep you signed in, remember theme preference, and keep the product working. You can block cookies in your browser, but some features may stop working.",
          ],
        },
        {
          title: "How long we keep information",
          paragraphs: [
            "We keep account details while your account is open. Messages stay available so conversations can sync, until you delete them or we close the account.",
            "Password-reset codes expire after a short window. We keep security and server logs for a limited time to investigate abuse and outages. When information is no longer needed, we delete or anonymize it.",
          ],
        },
        {
          title: "Your choices",
          paragraphs: [
            "You can update your name and other profile details in the product. You can request a copy of your information, ask us to correct it, or ask us to delete your account by emailing privacy@chatwave.app.",
            "If you signed in with Google or GitHub, you can also manage that connection in those products. Depending on where you live, you may have additional rights under local law, including the right to object to certain processing or to lodge a complaint with a regulator.",
          ],
        },
        {
          title: "Security",
          paragraphs: [
            "We use reasonable technical and organizational measures to protect your information, including hashed passwords and encrypted connections. No method of storage or transmission is completely secure. Protect your devices and do not share your password or one-time codes.",
          ],
        },
        {
          title: "Children",
          paragraphs: [
            "ChatWave is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you think a child has created an account, contact us and we will take it down.",
          ],
        },
        {
          title: "International use",
          paragraphs: [
            "If you use ChatWave from outside the country where we host the service, your information may be processed in another country. Those countries may have different data-protection laws than your own.",
          ],
        },
        {
          title: "Changes",
          paragraphs: [
            "We may update this policy as the product or the law changes. The date at the top is the latest version. If a change is material, we will try to let you know in the product or by email.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Privacy questions can be sent to privacy@chatwave.app.",
          ],
        },
      ]}
    />
  )
}
