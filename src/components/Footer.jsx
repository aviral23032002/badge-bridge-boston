import React from 'react';
import { Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-bar">
      <div className="footer-item"><Info size={14}/><span>Safety First</span></div>
      <div className="footer-item"><span>Suffolk County</span></div>
    </footer>
  );
};

export default Footer;