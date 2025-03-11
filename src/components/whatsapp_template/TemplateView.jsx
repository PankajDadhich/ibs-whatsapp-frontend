import React from "react";
import { Card } from "react-bootstrap";

const Templateview = (id) => {
  return (
    <div className="container py-4 bg-light min-vh-100">
      <div className="row g-4">
        {/* Template Card */}
        <div className="col-md-4">
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="fw-bold mb-3">Your template</Card.Title>
              <div className="border p-3 rounded bg-light">
                <p className="fw-semibold">Hi</p>
                <p>Welcome in company</p>
                <p className="mt-2 text-muted small">
                  Thanks & Regards <br />
                  <span className="fw-medium">IBirds Business</span>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Amount Spent Card */}
        <div className="col-md-4">
          <Card className="text-center shadow">
            <Card.Body>
              <Card.Title className="fw-bold">Amount spent</Card.Title>
              <p className="display-6 fw-semibold mt-2">₹9.42</p>
            </Card.Body>
          </Card>
        </div>

        {/* Cost Per Message Delivered Card */}
        <div className="col-md-4">
          <Card className="text-center shadow">
            <Card.Body>
              <Card.Title className="fw-bold">Cost per message delivered</Card.Title>
              <p className="display-6 fw-semibold mt-2">₹0.17</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Performance Card */}
      <Card className="mt-4 shadow">
        <Card.Body>
          <Card.Title className="fw-bold mb-3">Performance</Card.Title>
          <div className="row text-center">
            <div className="col-md-3">
              <h6 className="text-muted">Messages sent</h6>
              <p className="h4 fw-semibold">56</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Messages delivered</h6>
              <p className="h4 fw-semibold">56</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Messages read</h6>
              <p className="h4 fw-semibold">56 (100%)</p>
            </div>
            <div className="col-md-3">
              <h6 className="text-muted">Replies</h6>
              <p className="h4 fw-semibold">0</p>
            </div>
          </div>

          {/* Graph Placeholder */}
          <div className="mt-4 bg-light d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
            <p className="text-muted">Graph Placeholder</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Templateview;
