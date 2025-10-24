import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

const TestEventPage = () => {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Event Detail Page Test</h1>
        
        <div className="max-w-2xl mx-auto bg-[#1e1e2e] rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-[#ffcc00]">Test Event Links</h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#ffcc00]/40 transition-colors">
              <Link 
                href="/event/trend-1" 
                className="block flex justify-between items-center"
              >
                <span>Trending Market Test - trend-1</span>
                <span className="text-[#ffcc00]">→</span>
              </Link>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#ffcc00]/40 transition-colors">
              <Link 
                href="/event/5" 
                className="block flex justify-between items-center"
              >
                <span>Market with numeric ID - 5</span>
                <span className="text-[#ffcc00]">→</span>
              </Link>
            </div>
            
            <div className="p-4 border border-gray-700 rounded-lg hover:border-[#ffcc00]/40 transition-colors">
              <Link 
                href="/event/test-custom-id" 
                className="block flex justify-between items-center"
              >
                <span>Market with custom ID - test-custom-id</span>
                <span className="text-[#ffcc00]">→</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-[#121212] rounded-lg">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <p className="text-gray-300 text-sm">
              Click on any of the links above to test the event detail page. 
              If the page loads successfully, the clientModules error has been resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEventPage;