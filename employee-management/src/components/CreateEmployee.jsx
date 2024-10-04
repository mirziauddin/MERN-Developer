import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode to decode the token

const CreateEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    gender: "",
    course: [], // Store selected courses in an array
    image: null,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      image: file,
    }));
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const course = checked
        ? [...prevData.course, value]
        : prevData.course.filter((course) => course !== value);
      return { ...prevData, course }; // Store selected courses in an array
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Append user ID from token to FormData
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        formDataToSend.append("userId", decodedToken.userId); // Assuming the user ID is in the 'id' field
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    for (const key in formData) {
      if (key === "course") {
        // Append each course individually as a separate FormData entry
        formData.course.forEach((course) => {
          formDataToSend.append("course", course); // Append each course as an array item
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/employees",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Employee created:", response.data);
    } catch (error) {
      console.error("Error creating employee:", error);
      setError(error.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Employee</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            pattern="[0-9]{10}"
            title="Please enter a valid 10-digit mobile number."
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Designation</label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          >
            <option value="">Select Designation</option>
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Gender</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="radio"
                name="gender"
                value="M"
                checked={formData.gender === "M"}
                onChange={handleChange}
                required
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="F"
                checked={formData.gender === "F"}
                onChange={handleChange}
                required
              />
              Female
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Courses</label>
          <label className="block">
            <input
              type="checkbox"
              value="MCA"
              checked={formData.course.includes("MCA")}
              onChange={handleCourseChange}
            />
            MCA
          </label>
          <label className="block">
            <input
              type="checkbox"
              value="BCA"
              checked={formData.course.includes("BCA")}
              onChange={handleCourseChange}
            />
            BCA
          </label>
          <label className="block">
            <input
              type="checkbox"
              value="BSC"
              checked={formData.course.includes("BSC")}
              onChange={handleCourseChange}
            />
            BSC
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Image</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Create Employee
        </button>
      </form>
    </div>
  );
};

export default CreateEmployee;
