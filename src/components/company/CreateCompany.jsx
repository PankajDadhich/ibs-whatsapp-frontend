import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import WhatsAppAPI from "../../api/WhatsAppAPI";
import { faL } from "@fortawesome/free-solid-svg-icons";
import jwt_decode from "jwt-decode";

const CreateCompany = () => {
  const [userInfo, setUserInfo] = useState(
    jwt_decode(localStorage.getItem("token"))
  );
  const location = useLocation();
  const initialData = location.state;
  const navigate = useNavigate();
  const isEditMode = !!initialData?.id;
  const [formNumber, setFormNumber] = useState(0);
  const [formData, setFormData] = useState({
    schema: {
      source_schemaname: "",
      target_schemaname: "",
    },
    company_info: {
      name: "",
      tenantcode: "",
      isactive: false,
      systememail: userInfo.email,
      adminemail: "",
      logourl: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    user_info: {
      firstname: "",
      lastname: "",
      password: "",
      email: "",
      phone: "",
    },
    invoice: {
      plan: "",
      planname: "",
      amount: "",
      validity: "",
      date: "",
    },
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableSchemas, setAvailableSchemas] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const steps = [
    "Schema Information",
    "Company Information",
    "Company Address",
    "User Information",
    "Subscription Plans",
  ];
  // const [emailError, setEmailError] = useState({ systememail: '', adminemail: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSchemas();
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPlans();
      if (initialData && initialData.id) {
        fetchCompany(initialData.id);
      }
    };
    fetchData();
  }, [initialData]);

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

  const fetchSchemas = async () => {
    const result = await WhatsAppAPI.fetchSourceSchemas();
    if (result.sourceSchemaResult) {
      setAvailableSchemas(result.sourceSchemaResult);
    } else {
      toast.error("Failed to fetch schemas.");
    }
  };

  const fetchCompany = async (id) => {
    try {
      const response = await WhatsAppAPI.findCompanyWithUser(id);
      //  console.log('response',response)
      if (response.companyResult) {
        const companyData = response.companyResult[0];

        const selected = availablePlans.find(
          (plan) => plan.plan_info.id === companyData.plan_id
        );
        setIsFreePlan(true);
        setSelectedPlan(selected);
        setFormData({
          schema: {
            source_schemaname: companyData.sourceschema,
            target_schemaname: companyData.tenantcode,
          },
          company_info: {
            companyId: companyData.company_id,
            name: companyData.company_name,
            tenantcode: companyData.tenantcode,
            isactive: companyData.isactive,
            systememail: companyData.systememail,
            adminemail: companyData.adminemail,
            logourl: companyData.logourl,
            street: companyData.street,
            city: companyData.city,
            state: companyData.state,
            pincode: companyData.pincode,
            country: companyData.country || "India",
          },
          user_info: {
            userId: companyData.user_id,
            firstname: companyData.firstname,
            lastname: companyData.lastname,
            password: companyData.password,
            email: companyData.email,
            phone: companyData.phone || "",
          },
          invoice: {
            plan: companyData.plan_id,
            planname: companyData.plan_name,
            amount: companyData.amount,
            validity: companyData.validity,
            date: new Date(companyData.invoice_date)
              .toISOString()
              .split("T")[0],
            subscriptionId: companyData.subscription_id,
            invoiceId: companyData.invoice_id,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      };

      if (section === "schema" && name === "target_schemaname") {
        updatedData.company_info.tenantcode = value;

        let password = value.split("_");
        password = password[0] + "#@" + Math.floor(Math.random() * 1000 + 100);
        updatedData.user_info.password = password;
      }
      if (section === "user_info" && name === "email") {
        updatedData.company_info.adminemail = value;
      }

      return updatedData;
    });
  };

  const handleFileUpload = (e, section, key) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: file,
        },
      }));
    } else {
      toast.error("Only PNG and JPG images are allowed.");
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateStep = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formNumber === 0) {
      const { source_schemaname, target_schemaname } = formData.schema;
      const isTargetSchemaValid = availableSchemas.includes(target_schemaname);
      if (isEditMode) {
        return (
          source_schemaname.trim() !== "" && target_schemaname.trim() !== ""
        );
      }

      return (
        source_schemaname.trim() !== "" &&
        target_schemaname.trim() !== "" &&
        source_schemaname !== target_schemaname &&
        !isTargetSchemaValid
      );
    }
    if (formNumber === 1) {
      const { systememail, logourl } = formData.company_info;

      const isSystemEmailValid = emailRegex.test(systememail);
      const isLogoFileValid =
        (logourl instanceof File && logourl.name.trim() !== "") ||
        (typeof logourl === "string" && logourl.trim() !== "");

      return (
        formData.company_info.name.trim() !== "" &&
        systememail.trim() !== "" &&
        isSystemEmailValid &&
        isLogoFileValid
      );
    }

    if (formNumber === 3) {
      return (
        formData.user_info.firstname.trim() !== "" &&
        formData.user_info.lastname.trim() !== "" &&
        emailRegex.test(formData.user_info.email) &&
        formData.user_info.phone.trim() !== "" &&
        formData.user_info.password.trim() !== ""
      );
    }
    if (formNumber === 4) {
      const { plan, date, amount } = formData.invoice;

      const isAmountRequired = !isFreePlan;
      return (
        plan.trim() !== "" &&
        date.trim() !== "" &&
        (!isAmountRequired || amount > 0)
      );
    }

    return true;
  };

  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    const selected = availablePlans.find(
      (plan) => String(plan.plan_info.id) === String(selectedPlanId)
    );

    setSelectedPlan(null);
    setFormData((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        planname: "",
        plan: "",
        amount: "",
        validity: "",
      },
    }));

    setSelectedPlan(selected);
    const isFreePlan = selected.plan_info.name.toLowerCase() === "free";

    setFormData((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        planname: selected.plan_info.name,
        plan: selectedPlanId,
        amount: isFreePlan ? "" : prev.invoice.amount,
        validity: "",
      },
    }));

    setIsFreePlan(isFreePlan);
  };

  const handleAmountTypeChange = (e) => {
    const selectedAmount = Number(e.target.value);
    setFormData((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        validity:
          selectedAmount === selectedPlan.plan_info.price_per_month ? 1 : 12,
        amount: selectedAmount,
      },
    }));
  };

  const handleBackClick = () => {
    if (formNumber > 0) {
      setFormNumber(formNumber - 1);
    } else {
      navigate("/company");
    }
  };

  const handleNextClick = async () => {
    if (formNumber === 1) {
      const selected = availablePlans.find(
        (plan) => plan.plan_info.id === formData.invoice.plan
      );
      setSelectedPlan(selected);
    }
    if (formNumber === 3) {
      const { email, userId } = formData.user_info;
      try {
        const emailCheckResponse = await WhatsAppAPI.duplicateEmailCheck(
          email,
          userId
        );
        if (emailCheckResponse.success) {
          toast.error(
            "This email is already registered. Please use a different email."
          );
          return;
        }
      } catch (error) {
        toast.error("Unable to verify email. Please try again.");
        return;
      }
    }
    if (formNumber < steps.length - 1) {
      setFormNumber(formNumber + 1);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = formData.company_info.companyId
        ? await WhatsAppAPI.updateCompanyWithUser(formData)
        : await WhatsAppAPI.createCompany(formData);
      if (result.success) {
        toast.success(
          formData.company_info.companyId
            ? "Record updated successfully."
            : "Record created successfully."
        );
        navigate("/company");
      } else {
        toast.error(result.message || "Failed to save record.");
      }
    } catch (error) {
      console.error("Error during save operation", error);
      toast.error("An unexpected error occurred while saving the record.");
    }
  };

  return (
    <>
      <Container className="mt-5">
        <Row className="mx-5 text-center g-0">
          <Col lg={12} sm={12}>
            <div
              className="text-center p-2"
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
                Add Company
              </span>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className="mt-4 mb-5">
        <Row className="mx-5 g-0">
          <Col lg={12} sm={12}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`text-center ${
                        index === formNumber
                          ? "fw-bold text-white"
                          : "text-light"
                      }`}
                      style={{ flex: 1 }}
                    >
                      <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                          index === formNumber
                            ? "bg-white text-primary"
                            : "rgb(125 156 233) text-white"
                        }`}
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: "1rem",
                          marginTop: "0.9rem",
                        }}
                      >
                        {index + 1}
                      </div>
                      <div
                        className="mb-2"
                        style={{ fontSize: "0.9rem", marginTop: "0.2rem" }}
                      >
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Header>
              <Card.Body className="m-5">
                <Row>
                  <Col>
                    {formNumber === 0 && (
                      <Form>
                        <h2 className="mb-3">Your Schema Information</h2>
                        <p className="text-muted mb-4">
                          <em>Enter your Schema information.</em>
                        </p>
                        <Row className="mb-3">
                          <Col lg={12} sm={12} xs={12}>
                            <Form.Group>
                              <Form.Label>Source Schema</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                as="select"
                                name="source_schemaname"
                                value={formData.schema.source_schemaname}
                                onChange={(e) => handleChange(e, "schema")}
                                required
                                disabled={isEditMode}
                              >
                                <option value="">Select Schema</option>
                                {availableSchemas.map((schema) => (
                                  <option key={schema} value={schema}>
                                    {schema}
                                  </option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col lg={12} sm={12} xs={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Target Schema</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Target Schema"
                                name="target_schemaname"
                                value={formData.schema.target_schemaname}
                                onChange={(e) => handleChange(e, "schema")}
                                required
                                disabled={isEditMode}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    )}
                    {formNumber === 1 && (
                      <Form>
                        <h2 className="mb-3">Company Information</h2>
                        <p className="text-muted mb-4">
                          <em>Enter your Company information.</em>
                        </p>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Company Name</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Name"
                                name="name"
                                value={formData.company_info.name}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Tenant Code</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Tenant Code"
                                name="tenantcode"
                                value={formData.company_info.tenantcode}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                                disabled
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Logo URL</Form.Label>
                              <Form.Control
                                type="file"
                                accept=".png, .jpg"
                                onChange={(e) =>
                                  handleFileUpload(e, "company_info", "logourl")
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>System Email</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="email"
                                placeholder="Enter System Email"
                                name="systememail"
                                value={formData.company_info.systememail}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                                // isInvalid={!!emailError.systememail}
                                disabled
                              />
                              {/* <Form.Control.Feedback type="invalid">
                                    {emailError.systememail}
                                  </Form.Control.Feedback> */}
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Status</Form.Label>
                              <div>
                                <Form.Check
                                  type="checkbox"
                                  id="isactive-checkbox"
                                  label="Active"
                                  name="isactive"
                                  checked={
                                    formData.company_info.isactive === true
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      {
                                        target: {
                                          name: "isactive",
                                          value: e.target.checked,
                                        },
                                      },
                                      "company_info"
                                    )
                                  }
                                />
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    )}
                    {formNumber === 2 && (
                      <Form>
                        <h2 className="mb-3">Company Address</h2>
                        <p className="text-muted mb-4">
                          <em>Enter your Company Address.</em>
                        </p>
                        <Row className="mb-3">
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Street</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Street"
                                name="street"
                                value={formData.company_info.street}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter City"
                                name="city"
                                value={formData.company_info.city}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>State</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter State"
                                name="state"
                                value={formData.company_info.state}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Country</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Country"
                                name="country"
                                value={formData.company_info.country}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Pin Code</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Pin Code"
                                name="pincode"
                                value={formData.company_info.pincode}
                                onChange={(e) =>
                                  handleChange(e, "company_info")
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    )}
                    {formNumber === 3 && (
                      <Form>
                        <h2 className="mb-3">User Information</h2>
                        <p className="text-muted mb-4">
                          <em>Enter your User Information.</em>
                        </p>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter First Name"
                                name="firstname"
                                value={formData.user_info.firstname}
                                onChange={(e) => handleChange(e, "user_info")}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Last Name"
                                name="lastname"
                                value={formData.user_info.lastname}
                                onChange={(e) => handleChange(e, "user_info")}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="email"
                                placeholder="Enter Email"
                                name="email"
                                value={formData.user_info.email}
                                onChange={(e) => handleChange(e, "user_info")}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="text"
                                placeholder="Enter Phone Number"
                                name="phone"
                                value={formData.user_info.phone}
                                onChange={(e) => handleChange(e, "user_info")}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        {!("userId" in formData.user_info) && (
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <div style={{ position: "relative" }}>
                                  <Form.Control
                                    style={{
                                      height: "36px",
                                      paddingRight: "40px",
                                    }}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter Password"
                                    name="password"
                                    value={formData.user_info.password}
                                    onChange={(e) =>
                                      handleChange(e, "user_info")
                                    }
                                    required
                                  />
                                  <i
                                    className={`fa ${
                                      showPassword ? "fa-eye" : "fa-eye-slash"
                                    }`}
                                    onClick={togglePasswordVisibility}
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      cursor: "pointer",
                                      color: "#6c757d",
                                    }}
                                  ></i>
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                        )}
                      </Form>
                    )}

                    {formNumber === 4 && (
                      <Form>
                        <h2 className="mb-3">Plan</h2>
                        <p className="text-muted mb-4">
                          <em>Select Plan.</em>
                        </p>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Subscription Plan</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                as="select"
                                name="plan"
                                value={formData.invoice.plan}
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
                            <Form.Group>
                              <Form.Label>Date</Form.Label>
                              <Form.Control
                                style={{ height: "36px" }}
                                type="date"
                                name="date"
                                value={formData.invoice.date}
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
                                <Form.Group>
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
                                  <Form.Group>
                                    <Form.Label>Amount</Form.Label>
                                    <div className="d-flex align-items-center">
                                      {selectedPlan.plan_info.price_per_month >
                                        0 && (
                                        <Form.Check
                                          type="radio"
                                          name="amount"
                                          value={
                                            selectedPlan.plan_info
                                              .price_per_month
                                          }
                                          label={`Monthly: ₹ ${selectedPlan.plan_info.price_per_month}`}
                                          checked={
                                            formData.invoice.amount ===
                                            selectedPlan.plan_info
                                              .price_per_month
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
                                            selectedPlan.plan_info
                                              .price_per_year
                                          }
                                          label={`Yearly: ₹ ${selectedPlan.plan_info.price_per_year}`}
                                          checked={
                                            formData.invoice.amount ===
                                            selectedPlan.plan_info
                                              .price_per_year
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
                                <div className="mt-3">
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
                      </Form>
                    )}

                    <div className="text-end">
                      <Button
                        variant="light"
                        onClick={handleBackClick}
                        className="me-3"
                      >
                        Back
                      </Button>
                      {formNumber === steps.length - 1 ? (
                        <Button
                          variant="primary"
                          onClick={handleFormSubmit}
                          disabled={!validateStep()}
                        >
                          Submit
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={handleNextClick}
                          disabled={!validateStep()}
                        >
                          Next Step
                        </Button>
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

export default CreateCompany;
