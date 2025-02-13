import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link } from 'react-router-dom';

const MiniSidebar = () => {
    const [sidebar, setSidebar] = useState(true);
    
  return (
    <nav id="minisidebar" className="">
        <div className="minisidebar-header text-center">
            <div className="pb-1"><i className="fa-solid fa-cart-flatbed fa-2xl"></i> </div> <h3>iB</h3>
            </div>
            <ul className="list-unstyled components">
                <li  >
                <Link to="/" /*className="dropdown-toggle"*/> <i className="fa-solid fa-chart-simple mx-2"></i> </Link>
                    
                </li>
                <li>
                {/* <Link to="/"> <i className="fa-solid fa-chart-simple mx-2"></i> Accounts</Link> */}
                </li>
                
                <li >
                <Link to="/leads"> <i className="fa-solid fa-chart-simple mx-2"></i> </Link>
                </li>
                <li>
                <Link to="/products"> <i className="fa-solid fa-chart-simple mx-2"> </i> </Link>
                </li>
                <li>
                <Link to="/orders"> <i className="fa-solid fa-chart-simple mx-2"> </i> </Link> 
                </li>
            </ul>

            
        </nav>
  )
}

export default MiniSidebar

