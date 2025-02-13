import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import CityState from "../../constants/CityState.json";
import jwt_decode from "jwt-decode";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as constants from "../../constants/CONSTANT";

const LeadsAdd = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lead, setLead] = useState({
    ...location?.state,
    invoice: location?.state?.invoice || {
      planid: "",
      planname: "",
      amount: "",
      validity: "",
      date: "",
    },
  });
  
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isFreePlan, setIsFreePlan] = useState(false);

  const [lostReason, setLostReason] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;

  const [state, setState] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    if (location?.state) {
      setLostReason(
        location.state.status === "Closed - Not Converted" ? true : false
      );
    }

    async function init() {
      let st = [];
      CityState.map((item) => {
        var obj = {};
        obj.value = item.state;
        obj.label = item.state;
        st.push(obj);
      });
      let finalStates = {};
      st = st.filter(function (currentObject) {
        if (currentObject.value in finalStates) {
          return false;
        } else {
          finalStates[currentObject.value] = true;
          return true;
        }
      });
      if (lead.state) {
        setSelectedState(lead.state);
      }
      setState(st);
    }
    fetchPlans();
    init();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await WhatsAppAPI.getPlanData("active");
      if (response.success) {
        setAvailablePlans(response.records);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  useEffect(() => {
    if (selectedState) {
      const cities = CityState.filter(
        (item) => item.state === selectedState
      ).map((item) => ({ value: item.name, label: item.name }));
      setCities(cities);
    }
  }, [selectedState]);

  const handleState = (e) => {
    let filteredCities = [];
    CityState.forEach(function (obj) {
      if (obj.state === e.value) {
        filteredCities.push({
          label: obj.name,
          value: obj.name,
        });
      }
    });
    setCities(filteredCities);
    setLead({ ...lead, state: e.value });
  };

  const handleSelectListChange = (value, name) => {
    setLead({ ...lead, [name]: value.value });
    setSelectedCity(value.value);
  };

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setLostReason(false);
    if (section === "invoice") {
      setLead((prev) => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          [name]: value,
        },
      }));
    } else {
      if (name === "email") {
        if (value) {
          if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email address");
          } else {
            setEmailError("");
          }
        } else {
          setEmailError("");
        }
      }
      if (name === "mobile_no") {
        if (value) {
          if (!phoneRegex.test(value)) {
            setPhoneError("Phone number must be exactly 10 digits");
          } else {
            setPhoneError("");
          }
        } else {
          setPhoneError("");
        }
      }
  
      // Dynamically update based on status
      if (name === "status") {
        setLead((prev) => {
          let updatedInvoice = prev.invoice;
          let updatedLostReason = prev.lostreason;
  
          if (value === "Open - Not Contacted" || value === "Working - Contacted") {
            updatedInvoice = {
              planid: "",
              planname: "",
              amount: "",
              validity: "",
              date: "",
            };
            updatedLostReason = "";
          } else if (value === "Closed - Not Converted") {
            setLostReason(true);
            updatedInvoice = {
              planid: "",
              planname: "",
              amount: "",
              validity: "",
              date: "",
            };
            updatedLostReason = prev.lostreason || ""; 
          } else if (value === "Closed - Converted") {
            updatedInvoice = prev.invoice; 
            updatedLostReason = ""; 
          }
  
          return {
            ...prev,
            status: value,
            invoice: updatedInvoice,
            lostreason: updatedLostReason,
          };
        });
      } else {
        setLead((prev) => ({ ...prev, [name]: value }));
      }
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result = {};
    if (lead.id) {
      result = await WhatsAppAPI.updatePublicLead(lead);
  //    console.log("result updatePublicLead",result);
      if (result.errors) {
        toast.error(`${result.errors}`);
      } else {
        toast.success("Record updated successfully");
        navigate(`/web_leads/view/${lead.id}`, { state: lead });
      }
    } else {
      result = await WhatsAppAPI.createPublicLead(lead);
  //    console.log("result createPublicLead",result)
      if (result.errors) {
        toast.error(`${result.errors}`);
      } else {
        toast.success("Record saved successfully");
        navigate(`/web_leads/view/${result.id}`, { state: result });
      }
    }
  };

  

  const handleCancel = () => {
    navigate("/web_leads");
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    const selected = availablePlans.find(
      (plan) => String(plan.plan_info.id) === String(selectedPlanId)
    );
  
    if (!selected) {
      setSelectedPlan(null);
      setLead((prev) => ({
        ...prev,
        invoice: {
          planid: "",
          planname: "",
          amount: "",
          validity: "",
          date: "",
        },
      }));
      return;
    }
  
    setSelectedPlan(selected);
    const isFreePlan = selected.plan_info.name.toLowerCase() === "free";
    setIsFreePlan(isFreePlan);
    setLead((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        planid: selectedPlanId,
        planname: selected.plan_info.name,
        amount: "",
        validity: "",
        date: "",
      },
    }));
  };
  
  
  const handleAmountTypeChange = (e) => {
  const selectedAmount = Number(e.target.value);
  setLead((prev) => ({
    ...prev,
    invoice: {
      ...prev.invoice,
      amount: selectedAmount,
      validity:
        selectedAmount === selectedPlan.plan_info.price_per_month ? 1 : 12,
    },
  }));
};


  const isFormValid = (() => {
    const { first_name, last_name, mobile_no, status, email, invoice, company } = lead;
    const isBasicValid =
      Boolean(first_name?.trim()) &&
      Boolean(last_name?.trim()) &&
      Boolean(mobile_no?.trim()) &&
      Boolean(email?.trim()) &&
      Boolean(company?.trim()) &&
      Boolean(status?.trim()) &&
      phoneError === "" &&
      phoneRegex.test(mobile_no);
  
    if (status === "Closed - Converted") {
        const isAmountRequired = !isFreePlan; 
      return (
        isBasicValid &&
        Boolean(invoice?.planid?.trim()) &&
        Boolean(invoice?.date?.trim()) &&
        Boolean(!isAmountRequired  || (invoice?.amount > 0))
      );
    }else if (status === "Closed - Not Converted") {
      return isBasicValid && Boolean(lead.lostreason?.trim());
    }
    return isBasicValid;
  })();
  

  return (
    <>
      <Container className="mt-5">
        <Row className="g-0 mx-5 text-center ">
          <Col lg={12} xs={12} sm={12}>
            <div
              className=" text-center p-2"
              style={{
                height: "40px",
                backgroundColor: "#ffffff",
                borderRadius: "5px",
              }}
            >
              <span
                className="fw-semibold p-1"
                style={{ color: "#605C68", fontSize: "large" }}
              >
                {lead.id ? <>Edit Lead</> : <>Add Lead</>}
              </span>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className="mt-1 mb-5">
        <Row className="mx-5 g-0">
          <Col lg={12} sm={12} xs={12} className="mb-2">
            <Card className="h-100" style={{ border: "none" }}>
              <Card.Body>
                <Row className="mb-3">
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicFirstName"
                      >
                        {" "}
                        First Name
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="text"
                        name="first_name"
                        required={true}
                        placeholder="Enter First Name"
                        value={lead.first_name}
                        onChange={(e) => handleChange(e)}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide First Name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicLastName"
                      >
                        Last Name
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        required={true}
                        type="text"
                        name="last_name"
                        placeholder="Enter LastName"
                        value={lead.last_name}
                        onChange={(e) => handleChange(e)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicFirstName"
                      >
                        Phone
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="text"
                        name="mobile_no"
                        required
                        placeholder="Enter Phone"
                        value={lead.mobile_no}
                        onChange={(e) => handleChange(e)}
                        isInvalid={!!phoneError}
                      />
                      <Form.Control.Feedback type="invalid">
                        {phoneError}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        Email
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={lead.email}
                        onChange={(e) => handleChange(e)}
                        isInvalid={emailError !== ""}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {emailError}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3" controlId="formCampaignName">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        Company
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="text"
                        name="company"
                        placeholder="Enter Company"
                        value={lead.company}
                        onChange={(e) => handleChange(e)}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter Company.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicFees"
                      >
                        Status
                      </Form.Label>
                      <Form.Select
                        required
                        aria-label="Enter Status"
                        name="status"
                        style={{ height: "36px" }}
                        onChange={handleChange}
                        value={lead.status}
                      >
                        <option value="">--Select-Status--</option>
                        <option value="Open - Not Contacted">
                          Open - Not Contacted
                        </option>
                        <option value="Working - Contacted">
                          Working - Contacted
                        </option>
                        <option value="Closed - Converted">
                          Closed - Converted
                        </option>
                        <option value="Closed - Not Converted">
                          Closed - Not Converted
                        </option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Enter Status.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  {lostReason && (
                    <Col lg={6} sm={12} xs={12}>
                      <Form.Group className="ms-3">
                        <Form.Label
                          className="form-view-label"
                          htmlFor="formBasicFees"
                        >
                          Lost Reason
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="lostreason"
                          required
                          placeholder="Enter lost reason"
                          value={lead.lostreason}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                  )}
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicDescription"
                      >
                        Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        placeholder="Enter Description"
                        value={lead.description}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {lead.status === "Closed - Converted" && (
                  <>
                    <Row
                      lg={12}
                      sm={12}
                      xs={12}
                      className="py-3 my-4 section-header"
                    >
                      Plan INFORMATION
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group className="ms-3">
                          <Form.Label>Subscription Plan</Form.Label>
                          <Form.Control
                            style={{ height: "36px" }}
                            as="select"
                            name="plan"
                            value={lead.invoice.planid}
                            onChange={handlePlanChange}
                          >
                            <option value="">Select Plan</option>
                            {availablePlans.map((plan) => (
                              <option
                                key={plan.plan_info.id}
                                value={plan.plan_info.id}
                              >
                                {plan.plan_info.name}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="ms-3">
                          <Form.Label>Date</Form.Label>
                          <Form.Control
                            style={{ height: "36px" }}
                            type="date"
                            name="date"
                            value={lead.invoice.date}
                            onChange={(e) => handleChange(e, "invoice")}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    {selectedPlan && (
                      <>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="ms-3">
                              <strong>Number of Users</strong> :{" "}
                              {selectedPlan.plan_info.number_of_users || 0}{" "}
                              <br />
                              <strong>
                                Number of WhatsApp Settings
                              </strong> :{" "}
                              {selectedPlan.plan_info
                                .number_of_whatsapp_setting || 0}
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            {selectedPlan.plan_info.price_per_month > 0 ||
                            selectedPlan.plan_info.price_per_year > 0 ? (
                              <Form.Group className="ms-3">
                                <Form.Label>Amount</Form.Label>
                                <div className="d-flex align-items-center">
                                  {selectedPlan.plan_info.price_per_month >
                                    0 && (
                                    <Form.Check
                                      type="radio"
                                      name="amount"
                                      value={
                                        selectedPlan.plan_info.price_per_month
                                      }
                                      label={`Monthly: ₹ ${selectedPlan.plan_info.price_per_month}`}
                                      checked={
                                        lead.invoice.amount ===
                                        selectedPlan.plan_info.price_per_month
                                      }
                                      onChange={handleAmountTypeChange}
                                      className="me-3"
                                    />
                                  )}
                                  {selectedPlan.plan_info.price_per_year >
                                    0 && (
                                    <Form.Check
                                      type="radio"
                                      name="amount"
                                      value={
                                        selectedPlan.plan_info.price_per_year
                                      }
                                      label={`Yearly: ₹ ${selectedPlan.plan_info.price_per_year}`}
                                      checked={
                                        lead.invoice.amount ===
                                        selectedPlan.plan_info.price_per_year
                                      }
                                      onChange={handleAmountTypeChange}
                                    />
                                  )}
                                </div>
                              </Form.Group>
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <div className="mt-3 ms-3">
                              <strong className="mt-4 mb-2">Modules</strong>
                              <Row className="mt-2">
                                {selectedPlan.plan_modules.map(
                                  (module, index) => {
                                    return (
                                      <Col md={6} key={module.id}>
                                        <i className="fa fa-tasks mx-2"></i>
                                        {module.name}
                                      </Col>
                                    );
                                  }
                                )}
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </>
                    )}
                  </>
                )}

                <Row
                  lg={12}
                  sm={12}
                  xs={12}
                  className="py-3 my-4 section-header"
                >
                  ADDRESS INFORMATION
                </Row>
                <Row className="mb-3">
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        State
                      </Form.Label>
                      <Select
                        placeholder="Enter State"
                        defaultValue={{ label: lead.state, value: lead.state }}
                        value={
                          state.find((option) => option.value === lead.state) ||
                          null
                        }
                        onChange={handleState}
                        options={state}
                      ></Select>
                      <Form.Control.Feedback type="invalid">
                        Enter State.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        City
                      </Form.Label>
                      <Select
                        options={cities}
                        placeholder="Enter City"
                        onChange={(e) => {
                          handleSelectListChange(e, "city");
                        }}
                        name="city"
                        value={
                          cities.find((option) => option.value === lead.city) ||
                          null
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter City.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        Street
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="text"
                        name="street"
                        placeholder="Enter Street"
                        value={lead.street}
                        onChange={(e) => handleChange(e)}
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter Street.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        Country
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="text"
                        name="country"
                        placeholder="Enter Country"
                        value={lead.country}
                        onChange={(e) => handleChange(e)}
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter Country.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col lg={6} sm={12} xs={12}>
                    <Form.Group className="ms-3">
                      <Form.Label
                        className="form-view-label"
                        htmlFor="formBasicCompany"
                      >
                        Zip / PostalCode
                      </Form.Label>
                      <Form.Control
                        style={{ height: "36px" }}
                        type="text"
                        name="zipcode"
                        placeholder="Enter Zip / PostalCode"
                        value={lead.zipcode}
                        onChange={(e) => handleChange(e)}
                      />
                      <Form.Control.Feedback type="invalid">
                        Enter Zip / PostalCode.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mt-2">
                  <Col lg={12} sm={12} xs={12} className=" mt-4">
                    <hr></hr>
                  </Col>
                </Row>

                <Row className="g-0 mb-2">
                  <Col lg={12} sm={12} xs={12} className="text-end mt-2">
                    <Button
                      className="mx-2"
                      variant="light"
                      onClick={handleCancel}
                    >
                      Back
                    </Button>
                    <Button
                      variant="outline-secondary"
                      disabled={!isFormValid}
                      onClick={handleSubmit}
                      type="button"
                    >
                      Save
                    </Button>
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
export default LeadsAdd;
