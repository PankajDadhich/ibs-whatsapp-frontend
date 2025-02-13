import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { useNavigate} from 'react-router-dom';

const PlanExpire = ({userInfo}) => {
  const navigate = useNavigate();  
  console.log("userInfo",userInfo.companyid)

  const handleUpgrade = () => {
    navigate('/payment/'+userInfo.companyid, { state: userInfo });
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        height: '90vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
    
      <div
        style={{
          position: 'relative',
          width: '80%', 
          maxHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        
        <Image
          src="planexpire.png" 
          alt="Plan Expired Illustration"
          fluid
          style={{
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain', 
            borderRadius: '8px',
          }}
        />

       
        <div
          style={{
            position: 'absolute',
            bottom: '29%',
            left: '60%',
            textAlign: 'center',
          }}
        >
          <Button
            variant="success"
            size="lg"
            onClick={handleUpgrade}
            style={{
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
              fontSize: '1.2rem',
            }}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanExpire;
