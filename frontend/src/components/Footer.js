import React from 'react';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-green-700 to-green-600 text-white mt-20 border-t border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-100">Campus Canteen</h3>
            <p className="text-green-50/80 text-sm leading-relaxed">
              Your one-stop destination for delicious food and seamless ordering experience on campus.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-green-100">Quick Links</h4>
            <ul className="space-y-2 text-green-50/80 text-sm">
              <li><a href="#" className="hover:text-green-100 transition">Home</a></li>
              <li><a href="#" className="hover:text-green-100 transition">Menu</a></li>
              <li><a href="#" className="hover:text-green-100 transition">About Us</a></li>
              <li><a href="#" className="hover:text-green-100 transition">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-green-100">Support</h4>
            <ul className="space-y-2 text-green-50/80 text-sm">
              <li><a href="#" className="hover:text-green-100 transition">FAQs</a></li>
              <li><a href="#" className="hover:text-green-100 transition">Feedback</a></li>
              <li><a href="#" className="hover:text-green-100 transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-green-100 transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-green-100">Contact Us</h4>
            <div className="space-y-3 text-green-50/80 text-sm">
              <div className="flex items-center space-x-2">
                <FiMapPin className="text-green-200" />
                <span>University Campus</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiPhone className="text-green-200" />
                <span>+91 XXXXXXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiMail className="text-green-200" />
                <span>support@canteen.edu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-8 py-8 border-t border-green-500">
          <a href="#" className="text-green-100 hover:text-white transition text-xl">
            <FaFacebook />
          </a>
          <a href="#" className="text-green-100 hover:text-white transition text-xl">
            <FaTwitter />
          </a>
          <a href="#" className="text-green-100 hover:text-white transition text-xl">
            <FaInstagram />
          </a>
          <a href="#" className="text-green-100 hover:text-white transition text-xl">
            <FaLinkedin />
          </a>
        </div>

        {/* Bottom */}
        <div className="text-center text-green-50/80 text-sm border-t border-green-500 pt-8">
          <p>&copy; 2025 Campus Canteen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
