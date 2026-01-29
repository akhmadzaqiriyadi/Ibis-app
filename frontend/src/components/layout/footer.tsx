import Link from "next/link";
import { Instagram, Mail, MapPin } from "lucide-react";
import { CONTENT } from "@/constants/content";
import { Container } from "@/components/ui/container";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Address */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">{CONTENT.nav.logo}</h3>
            <div className="flex items-start gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm">{CONTENT.contact.address}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {CONTENT.nav.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${CONTENT.contact.email}`}
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-500" />
                {CONTENT.contact.email}
              </a>
              <a
                href="https://instagram.com/ibistek.uty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5 text-pink-500" />
                {CONTENT.contact.instagram}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} IBISTEK UTY. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};
