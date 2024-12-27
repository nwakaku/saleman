import { Divider } from "@nextui-org/react";
import { LuGithub, LuInstagram, LuLinkedin, LuTwitter } from "react-icons/lu";

const Footer = () => {
  const year = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Smart Menu", href: "#" },
        { name: "CRM System", href: "#" },
        { name: "Analytics", href: "#" },
        { name: "Pricing", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Contact", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Support", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: LuTwitter, href: "#" },
    { icon: LuInstagram, href: "https://www.instagram.com/saleman.xyz" },
    { icon: LuGithub, href: "#" },
    {
      icon: LuLinkedin,
      href: "https://www.linkedin.com/company/salemanxyz",
    },
  ];

  return (
    <footer className="w-full bg-[#003D29] text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-end space-x-2">
              <h2 className="text-2xl font-extrabold">
                <span className="text-green-400">Sale</span>man
                <span className="text-sm">.xyz</span>
              </h2>
            </div>
            <p className="mt-4 text-gray-300 text-sm">
              Transform your restaurant operations with AI-powered smart menus
              and comprehensive CRM solutions. Enhance customer experience and
              boost your business growth.
            </p>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Divider className="my-8 bg-gray-700" />

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300">
            © {year} Saleman. All rights reserved.
          </p>

          <div className="flex space-x-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200">
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
