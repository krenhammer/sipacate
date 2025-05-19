'use client';

import { useEffect, useState } from 'react';
import CustomSwaggerUI from './components/CustomSwaggerUI';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-custom.css';

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch('/api/swagger')
      .then(response => response.json())
      .then(data => setSpec(data))
      .catch(error => console.error('Error loading Swagger spec:', error));
  }, []);

  return (
    <div className="container mx-auto py-8">
      {spec ? (
        <CustomSwaggerUI spec={spec} />
      ) : (
        <div className="text-center py-10">Loading API documentation...</div>
      )}
    </div>
  );
} 