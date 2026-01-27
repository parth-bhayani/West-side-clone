import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            {/* Newsletter Section */}
            <div className="footer-newsletter">
                <div className="container">
                    <div className="newsletter-content">
                        <div className="newsletter-text">
                            <h3>Subscribe to our Newsletter</h3>
                            <p>Get updates on new arrivals, exclusive offers and more!</p>
                        </div>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Enter your email address" />
                            <button type="submit" className="btn btn-secondary">Subscribe</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        {/* Company Info */}
                        <div className="footer-col">
                            <h4 className="footer-logo">WESTSIDE</h4>
                            <p className="footer-desc">
                                India's leading fashion destination offering the latest trends in clothing,
                                footwear, and accessories for men, women, and kids.
                            </p>
                            <div className="footer-social">
                                <a href="#" aria-label="Facebook"><FiFacebook /></a>
                                <a href="#" aria-label="Instagram"><FiInstagram /></a>
                                <a href="#" aria-label="Twitter"><FiTwitter /></a>
                                <a href="#" aria-label="YouTube"><FiYoutube /></a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h5>Quick Links</h5>
                            <ul>
                                <li><Link to="/shop?gender=Women">Women</Link></li>
                                <li><Link to="/shop?gender=Men">Men</Link></li>
                                <li><Link to="/shop?gender=Kids">Kids</Link></li>
                                <li><Link to="/shop?sale=true">Sale</Link></li>
                                <li><Link to="/shop">New Arrivals</Link></li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div className="footer-col">
                            <h5>Customer Service</h5>
                            <ul>
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><Link to="/faq">FAQs</Link></li>
                                <li><Link to="/shipping">Shipping Info</Link></li>
                                <li><Link to="/returns">Returns & Exchange</Link></li>
                                <li><Link to="/size-guide">Size Guide</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer-col">
                            <h5>Contact Us</h5>
                            <ul className="contact-list">
                                <li>
                                    <FiPhone />
                                    <span>9313460023</span>
                                </li>
                                <li>
                                    <FiMail />
                                    <span>support@westside.com</span>
                                </li>
                                <li>
                                    <FiMapPin />
                                    <span>Ahmedabad, Gujarat, India</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p>&copy; 2024 Westside. All rights reserved. A Tata Enterprise.</p>
                        <div className="footer-bottom-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Use</Link>
                            <Link to="/sitemap">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
