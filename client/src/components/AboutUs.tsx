export default function About() {
  return (
    <section id="about" className="py-20 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-6">
            Why Choose PulseMail?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for modern businesses who need reliable, fast, and secure bulk email sending
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">Send thousands of emails in seconds with our optimized infrastructure</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Easy to Use</h3>
            <p className="text-gray-600">Upload CSV, write your message, and send. No technical knowledge required</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Secure & Private</h3>
            <p className="text-gray-600">Your data is encrypted and your privacy is protected with enterprise-grade security</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Campaign History</h3>
            <p className="text-gray-600">Track all your campaigns with detailed history and analytics</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4a2 2 0 012-2v-1a2 2 0 00-2-2H7m0 5V9h4a2 2 0 012 2v1a2 2 0 01-2 2H7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Custom Templates</h3>
            <p className="text-gray-600">Create and save email templates for consistent branding across campaigns</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Support</h3>
            <p className="text-gray-600">Get help when you need it with our dedicated customer support team</p>
          </div>
        </div>
      </div>
    </section>
  );
}
