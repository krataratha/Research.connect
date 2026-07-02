import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-bg-card border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-lg bg-gradient-primary text-white flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </span>
              <span className="font-bold text-xl tracking-tight text-text-primary">
                Research<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Enterprise-grade AI-powered Research Discovery & Collaboration Platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#researchers" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Researchers
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                  Support Helpdesk
                </a>
              </li>
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider mb-4">
              Legal & Contact
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span>Support: support@researchconnect.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Research Connect. All rights reserved.
          </p>
          <p className="text-xs text-text-secondary mt-2 md:mt-0">
            Phase 0 Foundation System
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
