import React from "react";
<<<<<<< HEAD
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
=======

const Templateview = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="font-bold text-lg mb-2">Your template</h3>
          <div className="border p-3 rounded bg-gray-50">
            <p className="font-semibold">Hi</p>
            <p>welcome in company</p>
            <p className="mt-2 text-sm text-gray-500">
              Thanks & Regards <br />
              <span className="font-medium">IBirds Business</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-md text-center">
          <h3 className="font-bold text-lg">Amount spent</h3>
          <p className="text-2xl font-semibold mt-2">₹9.42</p>
        </div>
        <div className="bg-white p-4 rounded shadow-md text-center">
          <h3 className="font-bold text-lg">Cost per message delivered</h3>
          <p className="text-2xl font-semibold mt-2">₹0.17</p>
        </div>
      </div>

      <div className="bg-white p-4 mt-4 rounded shadow-md">
        <h3 className="font-bold text-lg">Performance</h3>
        <div className="grid grid-cols-4 gap-4 mt-2">
          <div>
            <h4 className="text-sm text-gray-500">Messages sent</h4>
            <p className="text-xl font-semibold">56</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Messages delivered</h4>
            <p className="text-xl font-semibold">56</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Messages read</h4>
            <p className="text-xl font-semibold">56 (100%)</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-500">Replies</h4>
            <p className="text-xl font-semibold">0</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-48 bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400">Graph Placeholder</p>
          </div>
        </div>
      </div>
>>>>>>> 7e9db667582c7e95c4f451e3e5b1452d0b93b3f2
    </div>
  );
};

export default Templateview;
