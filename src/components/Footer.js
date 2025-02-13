// import React from "react";
// import { Col, Row } from "react-bootstrap";

// const Footer = () => {
//   return (
//     <footer className="footer p-2">
//       <Row className="g-0">
//         <Col lg={4} className="pt-2">
//           © 2023 Copyright
//           <a className="text-black" href="https://ibirdsservices.com/">
//             {" "}iBirds Services Pvt. Ltd.
//           </a>
//         </Col>
//         <Col lg={2}></Col>
//         <Col lg={4} className="ms-3">
//           <div className="text-end">
//             <a className="btn btn-outline-dark btn-floating m-1" role="button">
//               <i className="fab fa-facebook-f"></i>
//             </a>
//             <a className="btn btn-outline-dark btn-floating m-1" role="button">
//               <i className="fab fa-twitter"></i>
//             </a>
//             <a className="btn btn-outline-dark btn-floating m-1" role="button">
//               <i className="fab fa-google"></i>
//             </a>
//             <a className="btn btn-outline-dark btn-floating m-1" role="button">
//               <i className="fab fa-instagram"></i>
//             </a>
//           </div>
//         </Col>
//         <Col lg={2}></Col>
//       </Row>
//     </footer>
//   );
// };

// export default Footer;
import React from 'react'
import { Col, Row } from "react-bootstrap";
const Footer = () => {
  return (
    <footer className="p-3 w-100 text-white" style={{ background: "rgb(117 140 194)", position: "fixed", zIndex: '999', bottom: "0px" }}>
      <Row className="g-0">
        <Col lg={10} xs={6} sm={6} className="text-center">
          © Copyright<a className="text-white" href="https://ibirdsservices.com/">
            <b className='mx-2'>iBirds Software Services Pvt. Ltd.</b> All Rights Reserved.
          </a>
        </Col>
      </Row>
    </footer>
  )
}

export default Footer