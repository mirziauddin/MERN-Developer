import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Corrected import

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    gender: "",
    course: [], // Changed to an array to store multiple courses
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        setError("Invalid employee ID");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/employees/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmployee(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to fetch employee data. Please try again later.");
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleCourseChange = (e) => {
    const { value, checked } = e.target;
    setEmployee((prevEmployee) => {
      const updatedCourses = checked
        ? [...prevEmployee.course, value]
        : prevEmployee.course.filter((course) => course !== value);
      return { ...prevEmployee, course: updatedCourses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Decode the token to get the userId
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId; // Extracting userId from the token

    const formData = new FormData();
    formData.append("name", employee.name);
    formData.append("email", employee.email);
    formData.append("mobile", employee.mobile);
    formData.append("designation", employee.designation);
    formData.append("gender", employee.gender);
    formData.append("courses", JSON.stringify(employee.course)); // Send courses as JSON string

    // Log FormData contents
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    // Append userId to formData
    formData.append("userId", userId);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/employees/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Update response:", response);
      navigate("/employeeList");
    } catch (error) {
      console.error(
        "Error updating employee data:",
        error.response?.data || error.message
      );
      setError(
        "Failed to update employee data. Please check your input and try again."
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={employee.name}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="mobile">
              Mobile No
            </label>
            <input
              type="text"
              id="mobile"
              name="mobile"
              value={employee.mobile}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="designation">
              Designation
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={employee.designation}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={employee.gender}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">Select Gender</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Courses</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  value="MCA"
                  checked={employee.course.includes("MCA")}
                  onChange={handleCourseChange}
                />
                MCA
              </label>
              <label>
                <input
                  type="checkbox"
                  value="BCA"
                  checked={employee.course.includes("BCA")}
                  onChange={handleCourseChange}
                />
                BCA
              </label>
              <label>
                <input
                  type="checkbox"
                  value="BSC"
                  checked={employee.course.includes("BSC")}
                  onChange={handleCourseChange}
                />
                BSC
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2" htmlFor="image">
              Current Image
            </label>
            {employee.image && (
              <img
                src={employee.image}
                alt="Employee"
                className="mb-2 rounded"
                style={{ maxWidth: "200px" }}
              />
            )}
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Update Employee
          </button>
        </form>
      )}
    </div>
  );
};

export default EditEmployee;
