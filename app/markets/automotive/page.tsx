'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CategoryPage from '../[category]/page';

// Redirect to the dynamic category page with 'automotive' parameter
export default function AutomotivePage() {
  // This is a wrapper component that passes 'automotive' as the category parameter
  return <CategoryPage params={{ category: 'automotive' }} />;
}
