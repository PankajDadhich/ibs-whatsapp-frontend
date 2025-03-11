import React from "react";

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
    </div>
  );
};

export default Templateview;
