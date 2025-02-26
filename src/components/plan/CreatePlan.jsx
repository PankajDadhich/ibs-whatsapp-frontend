import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Table, Row, Col } from 'react-bootstrap';
import WhatsAppAPI from '../../api/WhatsAppAPI';
import { ToastContainer, toast } from 'react-toastify'; // npm i react-toastify --force
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';  

const CreatePlan = () => {
  const [formNumber, setFormNumber] = useState(0); 
  const [formData, setFormData] = useState({
    plan_info: {
      name: '',
      price_per_month: '',
      price_per_year: '',
      status: 'active',
      number_of_whatsapp_setting: '',
      number_of_users:''
    },
    plan_modules: [],
  });
  const [modules, setModules] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState({}); 
  const navigate = useNavigate();  
  const location = useLocation();  
  const initialData = location.state;  


  const steps = ['Plan Information', 'Module Permission'];

  useEffect(() => {
    const fetchModules = async () => {
      const result = await WhatsAppAPI.getModuleData('active');
      if (result.success) {
        setModules(result.records); 
      } else {
        setModules([]); 
      }
    };

    fetchModules();
    if (initialData) {
      setFormData(initialData);
      const initialChecked = {};
      initialData.plan_modules.forEach((module) => {
        initialChecked[module.id] = module;
      });
      setCheckedStatus(initialChecked); 
    }
  }, [initialData]);


  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name.startsWith('plan_info')) {
      const field = name.split('.')[1];
      if (
        (field === 'number_of_whatsapp_setting' || field === 'number_of_users' || field === 'price_per_month' || field === 'price_per_year') &&
        value < 0
      ) {
        return; 
      }
      setFormData((prev) => ({
        ...prev,
        plan_info: {
          ...prev.plan_info,
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    }
  };
  
  const modulePermission = (e) => {
    const { value, checked } = e.target;
    const selectedModule = modules.find((module) => module.id === value);

    if (checked) {
      setCheckedStatus((prev) => ({
        ...prev,
        [value]: selectedModule, 
      }));
    } else {
      setCheckedStatus((prev) => {
        const updated = { ...prev };
        delete updated[value];
        return updated;
      });
    }
  };
  

  const validateStep = () => {
    if (formNumber === 0) {
      const { name, price_per_month, price_per_year, number_of_whatsapp_setting, number_of_users } = formData.plan_info;
      return (
        name.trim() !== '' &&
        String(price_per_month).trim() !== '' &&  
        String(price_per_year).trim() !== '' &&   
        String(number_of_whatsapp_setting).trim() !== '' &&
        String(number_of_users).trim() !== '' && number_of_users > 0 && number_of_whatsapp_setting > 0

      );
    } else if (formNumber === 1) {
      return Object.keys(checkedStatus).length > 0;
    }
    return false;
};


const handleBackClick = () => {
  if (formNumber > 0) {
    setFormNumber(formNumber - 1);
  } else {
    navigate('/plan'); 
  }
};

  const handleNextClick = () => {
    if (formNumber < steps.length - 1) setFormNumber(formNumber + 1);
  };


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const selectedModules = Object.values(checkedStatus);
    const payload = {
      ...formData,
      plan_modules: selectedModules,
    };

    try {
        const result = payload.plan_info.id ? await WhatsAppAPI.updatePlanRecord(payload) : await WhatsAppAPI.insertPlanRecord(payload);

        if (result.success) {
            toast.success(payload.plan_info.id ? 'Record updated successfully.' : 'Record created successfully.');
            navigate('/plan'); 
        } else {
            toast.error(result.message || 'Failed to save record.');
        }
    } catch (error) {
        console.error('Error during save operation', error); 
        toast.error('An unexpected error occurred while saving the record.');
    }
};

  return (
    <>
       <Container className='mt-5'>
                <Row className='mx-5 text-center g-0'>
                    <Col lg={12} xs={12} sm={12}>
                        <div className=' text-center p-2' style={{ height: '40px', backgroundColor: '#ffffff', borderRadius: '5px' }}>
                            <span className='fw-semibold p-1' style={{ color: '#605C68', fontSize: 'large' }}>
                                Add Plan
                            </span>
                        </div>
                    </Col>
                </Row>
            </Container>
  <Container className='mt-4 mb-5'>
    <Row className='mx-5 g-0'>
    <Col lg={12} sm={12} xs={12} className="mb-2">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            {steps.map((step, index) => (
                 <div
                 key={index}
                 className={`text-center ${index === formNumber ? 'fw-bold text-white' : 'text-light'}`}
                 style={{ flex: 1 }}
               >
                 <div
                   className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                     index === formNumber ? 'bg-white text-primary' : 'rgb(125 156 233) text-white'
                   }`}
                   style={{ width: 32, height: 32, fontSize: '1rem', marginTop: '0.9rem' }}
                 >
                   {index + 1}
                 </div>
                 <div className='mb-2' style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{step}</div>
               </div>
            ))}
          </div>
        </Card.Header>
        <Card.Body className='m-5'>
          <Row>
            <Col>
              {formNumber === 0 && (
                <Form>
                  <h2 className='mb-3'>Plan Information</h2>
                  <Row className='mb-3'>
                  <Col lg={6} sm={12} xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      style={{ height: "36px" }}
                      type="text"
                      placeholder="Name"
                      name="plan_info.name"
                      value={formData.plan_info.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  </Col>
                  <Col lg={6} sm={12} xs={12}>
                  <Form.Group>
                  <Form.Label>Status</Form.Label>
                    <Form.Control
                      style={{ height: "36px" }}
                      as="select"
                      name="plan_info.status"
                      value={formData.plan_info.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Control>
                  </Form.Group>
                  </Col>
                  </Row>
                  <Row className='mb-3'>
                 
                  <Col lg={6} sm={12} xs={12}>
                 <Form.Group className="mb-3">
                   <Form.Label>Number of Users</Form.Label>
                   <Form.Control
                     style={{ height: "36px" }}
                      type="number"
                     placeholder="Number of Users"
                     name="plan_info.number_of_users"
                     value={formData.plan_info.number_of_users}
                     onChange={handleChange}
                     required
                   />
                 </Form.Group>
                 </Col>
                  
                 <Col lg={6} sm={12} xs={12}>
                 <Form.Group className="mb-3">
                   <Form.Label>Number of WhatsApp Settings</Form.Label>
                   <Form.Control
                     style={{ height: "36px" }}
                      type="number"
                     placeholder="Number of WhatsApp settings"
                     name="plan_info.number_of_whatsapp_setting"
                     value={formData.plan_info.number_of_whatsapp_setting}
                     onChange={handleChange}
                     required
                   />
                 </Form.Group>
                 </Col>
                 </Row>
                  <Row className='mb-3'>
                  <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price Per Month</Form.Label>
                        <Form.Control
                          style={{ height: "36px" }}
                           type="number"
                          placeholder="Price per month"
                          name="plan_info.price_per_month"
                          value={formData.plan_info.price_per_month}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="">
                        <Form.Label>Price Per Year</Form.Label>
                        <Form.Control
                          style={{ height: "36px" }}
                          type="number"
                          placeholder="Price per year"
                          name="plan_info.price_per_year"
                          value={formData.plan_info.price_per_year}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                 
                </Form>
              )}
              {formNumber === 1 && (
                <>
                  <h3>Module Permissions</h3>
                  <div
                    style={{
                      height: '300px',
                      overflowY: 'auto',
                      marginBottom: '30px',
                    }}
                  >
                    <Table striped>
                      <thead>
                        <tr>
                          <th>Modules</th>
                          <th>Permission</th>
                        </tr>
                      </thead>
                      <tbody>
                      {modules &&
                                modules.map((module, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <i className={`${module.icon} mx-1`}></i> {module.name}
                                    </td>
                                    <td>
                                      <Form.Check
                                        type="checkbox"
                                        name="module"
                                        value={module.id}
                                        onChange={modulePermission}
                                        checked={!!checkedStatus[module.id]}
                                      />
                                    </td>
                                  </tr>
                                ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
              <div className="text-end">
                <button className='me-3 btn btn-light' onClick={handleBackClick}>
                  Back
                </button>
                {formNumber === steps.length - 1 ? (
                <button
                  className="btn btn-outline-primary"
                  onClick={handleFormSubmit}
                  disabled={!validateStep()} >
                  Submit
                </button>
              ) : (
                <button
                  className="btn btn-outline-primary"
                  onClick={handleNextClick}
                  disabled={!validateStep()} >
                  Next Step
                </button>
              )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      </Col>
      </Row>
      </Container>
      <ToastContainer />
      </>
  );
};

export default CreatePlan;
