import Link from "next/link";
import { FaXTwitter,FaInstagram   } from "react-icons/fa6";
import { FaLinkedin  } from "react-icons/fa";


export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              PulseMail
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Send bulk emails effortlessly with our secure, fast, and reliable platform. Perfect for businesses of all sizes.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/hridayansh018" className="text-gray-400 hover:text-white transition-colors">
                <FaXTwitter />
              </a>
              <a href="https://www.linkedin.com/in/hridayansh-awasthi-0095a12b6" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin />
              </a>
              <a href="https://www.instagram.com/__hridayansh/" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/auth" className="text-gray-400 hover:text-white transition-colors">Get Started</Link></li>
              {/* <li><Link href="/history" className="text-gray-400 hover:text-white transition-colors">History</Link></li> */}
            </ul>
          </div>

          {/* Support */}
          <div>
            {/* <h4 className="text-lg font-semibold mb-4">Support</h4> */}
            <ul className="space-y-2">
              {/* <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li> */}
              {/* <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li> */}
              {/* <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li> */}
              {/* <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
          <p>&copy; 2025 PulseMail. All rights reserved. Built with ❤️ for modern businesses.</p>
        </div>
      </div>
    </footer>
  );
}
