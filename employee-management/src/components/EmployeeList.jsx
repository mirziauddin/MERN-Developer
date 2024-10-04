import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/employees/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to fetch employees.");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees
    .filter((employee) =>
      employee.name.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * employeesPerPage,
    (currentPage - 1) * employeesPerPage + employeesPerPage
  );

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );
    if (confirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(employees.filter((employee) => employee.id !== id));
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee.");
      }
    }
  };

  const handleToggleActive = async (employeeId, isActive) => {
    const newStatus = isActive === "Active" ? "Deactive" : "Active";
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/employees/${employeeId}/active`,
        { active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === employeeId
            ? { ...employee, isActive: newStatus }
            : employee
        )
      );

      console.log("Employee updated:", response.data);
    } catch (error) {
      console.error("Error updating employee status:", error);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Employee List</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-between mb-4">
        <div>
          <strong>Total Count: {employees.length}</strong>
          <button className="ml-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            <Link to="/create-employee">Add Employee</Link>
          </button>
        </div>
        <div className="flex-grow ml-4">
          <input
            type="text"
            placeholder="Enter Search Keyword"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
      </div>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Unique Id</th>
            <th className="border border-gray-300 p-2">Image</th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("email")}
            >
              Email
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("mobile")}
            >
              Mobile No
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("designation")}
            >
              Designation
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("gender")}
            >
              Gender
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("course")}
            >
              Course
            </th>
            <th
              className="border border-gray-300 p-2 cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              Create Date
            </th>
            <th className="border border-gray-300 p-2">Action</th>
            <th className="border border-gray-300 p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="text-center">
                Loading...
              </td>
            </tr>
          ) : currentEmployees.length > 0 ? (
            currentEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="border border-gray-300 p-2">{employee.id}</td>
                <td className="border border-gray-300 p-2">
                  <img
                    src={employee.image || "path/to/default/image.png"}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                <td className="border border-gray-300 p-2">{employee.name}</td>
                <td className="border border-gray-300 p-2">{employee.email}</td>
                <td className="border border-gray-300 p-2">
                  {employee.mobile}
                </td>
                <td className="border border-gray-300 p-2">
                  {employee.designation}
                </td>
                <td className="border border-gray-300 p-2">
                  {employee.gender}
                </td>
                <td className="border border-gray-300 p-2">
                  {employee.course}
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">
                  <button className="text-blue-500 hover:underline">
                    <Link to={`/edit-employee/${employee.id}`}>Edit</Link>
                  </button>{" "}
                  -{" "}
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </button>{" "}
                  -{" "}
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    className={`text-${
                      employee.isActive === "Active" ? "red" : "green"
                    }-500 hover:underline`}
                    onClick={() =>
                      handleToggleActive(employee.id, employee.isActive)
                    }
                  >
                    {employee.isActive === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="text-center">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeList;
