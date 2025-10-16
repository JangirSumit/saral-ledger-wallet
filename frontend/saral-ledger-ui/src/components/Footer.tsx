const Footer = () => {
  return (
    <footer className="footer-custom mt-auto">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="footer-text mb-0">
              © {new Date().getFullYear()} SaralPay. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="footer-text mb-0">
              🔒 Secure Ledger Management System
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;