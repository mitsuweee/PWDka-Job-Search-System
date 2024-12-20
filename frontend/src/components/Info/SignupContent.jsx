import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";

const MAX_FILE_SIZE = 16777215; // 16MB

const Signup = () => {
  const [formType, setFormType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userFormValues, setUserFormValues] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    gender: "",
    address: "",
    city: "",
    birthdate: "",
    contactNumber: "",
    email: "",
    disability: "",
    password: "",
    reEnterPassword: "",
    pwdID: "",
    idPicture: "",
    profilePicture: "",
    selfieWithID: "",
    resume: "",
  });

  const [companyFormValues, setCompanyFormValues] = useState({
    companyName: "",
    companyDescription: "",
    companyAddress: "",
    companyCity: "",
    companyContactNumber: "",
    companyEmail: "",
    companyPassword: "",
    companyReEnterPassword: "",
    companyLogo: "",
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error("No file selected. Please upload a file.");
      return;
    }

    if (type === "resume") {
      // Handle only PDF files for resume
      if (file.type === "application/pdf") {
        if (file.size <= MAX_FILE_SIZE) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result.split(",")[1];
            setUserFormValues((prevState) => ({
              ...prevState,
              resume: base64Data,
            }));
          };
          reader.readAsDataURL(file);
          toast.success("Resume uploaded successfully!");
        } else {
          toast.error(
            "File size exceeds 16MB. Please upload a smaller resume."
          );
        }
      } else {
        toast.error("Only PDF files are allowed for the resume.");
      }
      return;
    }

    // Handle other file types (image/png, image/jpeg)
    if (file.type === "image/png" || file.type === "image/jpeg") {
      if (file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1];
          if (type === "userProfile") {
            setUserFormValues((prevState) => ({
              ...prevState,
              profilePicture: base64Data,
            }));
          } else if (type === "selfieWithID") {
            setUserFormValues((prevState) => ({
              ...prevState,
              selfieWithID: base64Data,
            }));
          } else if (type === "idPicture") {
            setUserFormValues((prevState) => ({
              ...prevState,
              idPicture: base64Data,
            }));
          } else if (type === "companyLogo") {
            setCompanyFormValues((prevState) => ({
              ...prevState,
              companyLogo: base64Data,
            }));
          }
        };
        reader.readAsDataURL(file);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("File size exceeds 16MB. Please upload a smaller file.");
      }
    } else {
      toast.error("Please upload a jpeg/png file.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (formType === "user") {
      setUserFormValues((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setCompanyFormValues((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleReset = () => {
    if (formType === "user") {
      setUserFormValues({
        firstName: "",
        middleInitial: "",
        lastName: "",
        gender: "",
        address: "",
        city: "",
        birthdate: "",
        contactNumber: "",
        email: "",
        disability: "",
        password: "",
        reEnterPassword: "",
        pwdID: "",
        idPicture: "",
        profilePicture: "",
        selfieWithID: "",
        resume: "", // add
      });
    } else {
      setCompanyFormValues({
        companyName: "",
        companyDescription: "",
        companyAddress: "",
        companyCity: "",
        companyContactNumber: "",
        companyEmail: "",
        companyPassword: "",
        companyReEnterPassword: "",
        companyLogo: "",
      });
    }
    toast.success("Form reset successfully!");
  };
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const isCompany = formType === "company";

    const data = JSON.stringify(
      isCompany
        ? {
            name: companyFormValues.companyName,
            address: companyFormValues.companyAddress.toLowerCase(),
            city: companyFormValues.companyCity.toLowerCase(),
            description: companyFormValues.companyDescription,
            contact_number: companyFormValues.companyContactNumber,
            email: companyFormValues.companyEmail.toLowerCase(),
            password: companyFormValues.companyPassword,
            confirm_password: companyFormValues.companyReEnterPassword,
            profile_picture: companyFormValues.companyLogo,
          }
        : {
            id: userFormValues.pwdID,
            first_name: userFormValues.firstName.toLowerCase(),
            middle_initial: userFormValues.middleInitial.toLowerCase(),
            last_name: userFormValues.lastName.toLowerCase(),
            address: userFormValues.address.toLowerCase(),
            city: userFormValues.city.toLowerCase(),
            gender: userFormValues.gender.toLowerCase(),
            birth_date: userFormValues.birthdate,
            email: userFormValues.email.toLowerCase(),
            password: userFormValues.password,
            confirm_password: userFormValues.reEnterPassword,
            contact_number: userFormValues.contactNumber,
            disability_id: userFormValues.disability,
            formal_picture: userFormValues.profilePicture,
            picture_with_id: userFormValues.selfieWithID,
            picture_of_pwd_id: userFormValues.idPicture,
            resume: userFormValues.resume, //added resume par
          }
    );

    const config = {
      method: "post",
      url: isCompany ? "/company/register" : "/user/register",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then((response) => {
        toast.success(response.data.message);
        setLoading(false);

        // Reload and redirect by adding a timestamp to the URL after a 3-second delay
        setTimeout(() => {
          window.location.href = `/login?redirect=${new Date().getTime()}`;
        }, 3500);
      })
      .catch((error) => {
        setLoading(false);
        // Handle error (e.g., show error toast or log the error)

        if (error.response) {
          const { data } = error.response;
          const errorMessage = data.message || "An unexpected error occurred.";
          toast.error(errorMessage);
        } else {
          toast.error("Network error. Please check your connection.");
        }
      });
  };

  const renderUserForm = () => (
    <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
      <div className="col-span-12">
        <h2 className="text-3xl font-bold text-custom-blue">
          <Typewriter
            options={{
              autoStart: true,
              loop: true,
              delay: 50,
              strings: ["Join us Now!", "Please Sign Up!"],
              cursor: "|",
              wrapperClassName: "typewriter-wrapper",
              cursorClassName: "typewriter-cursor",
            }}
          />
        </h2>
      </div>

      <div className="col-span-12 md:col-span-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="firstName"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userFormValues.firstName}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="middleInitial"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Middle Initial
            </label>
            <input
              type="text"
              maxLength="1"
              id="middleInitial"
              name="middleInitial"
              value={userFormValues.middleInitial}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="lastName"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userFormValues.lastName}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="gender"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={userFormValues.gender}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 bg-white text-gray-600 rounded-lg focus:outline-none border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="birthdate"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Birthdate <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={userFormValues.birthdate}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="address"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={userFormValues.address}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                const regex = /^[a-zA-Z0-9\s]*$/;
                if (
                  !regex.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete"
                ) {
                  e.preventDefault();
                }
              }}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="city"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={userFormValues.city}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="contactNumber"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={userFormValues.contactNumber}
              onChange={handleInputChange}
              pattern="[0-9]{10,11}"
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(
                    e.key
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="disability"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Disability <span className="text-red-500">*</span>
            </label>
            <select
              id="disability"
              name="disability"
              value={userFormValues.disability}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 bg-white text-gray-600 rounded-lg focus:outline-none border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            >
              <option value="" disabled>
                Select disability
              </option>
              <option value="Deaf or Hard of Hearing">
                Deaf or Hard of Hearing
              </option>
              <option value="Intellectual Disability">
                Intellectual Disability
              </option>
              <option value="Learning Disability">Learning Disability</option>
              <option value="Mental Disability">Mental Disability</option>
              <option value="Physical Disability (Orthopedic)">
                Physical Disability (Orthopedic)
              </option>
              <option value="Psychosocial Disability">
                Psychosocial Disability
              </option>
              <option value="Speech and Language Impairment">
                Speech and Language Impairment
              </option>
              <option value="Visual Disability">Visual Disability</option>
              <option value="Cancer (RA11215)">Cancer (RA11215)</option>
              <option value="Rare Disease (RA10747)">
                Rare Disease (RA10747)
              </option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="email"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userFormValues.email}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="password"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={userFormValues.password}
                onChange={handleInputChange}
                className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 pr-10 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="reEnterPassword"
              className="block text-sm md:text-lg font-medium text-gray-700 whitespace-nowrap truncate"
            >
              Re-Enter Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showReEnterPassword ? "text" : "password"}
                id="reEnterPassword"
                name="reEnterPassword"
                value={userFormValues.reEnterPassword}
                onChange={handleInputChange}
                className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 pr-10 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowReEnterPassword(!showReEnterPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
              >
                <span className="material-symbols-outlined">
                  {showReEnterPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-4">
        <div>
          <label
            htmlFor="pwdID"
            className="block text-lg font-medium text-gray-700"
          >
            PWD ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pwdID"
            name="pwdID"
            placeholder="00-0000-000-0000000"
            value={userFormValues.pwdID}
            onChange={handleInputChange}
            pattern="[0-9]{2}-[0-9]{4}-[0-9]{3}-[0-9]{7}"
            onKeyDown={(e) => {
              const allowedKeys = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
                "-",
              ];
              if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="idPicture"
            className="block text-lg font-medium text-gray-700"
          >
            PWD ID Picture <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="idPicture"
            name="idPicture"
            onChange={(e) => handleFileChange(e, "idPicture")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            accept="image/png, image/jpeg"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="profilePicture"
            className="block text-lg font-medium text-gray-700"
          >
            Profile Picture <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            onChange={(e) => handleFileChange(e, "userProfile")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            accept="image/png, image/jpeg"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="selfieWithID"
            className="block text-lg font-medium text-gray-700"
          >
            Selfie with PWD ID <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="selfieWithID"
            name="selfieWithID"
            onChange={(e) => handleFileChange(e, "selfieWithID")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            accept="image/*"
          />
        </div>

        {/* {added resume} */}
        <div className="mt-4">
          <label
            htmlFor="resume"
            className="block text-lg font-medium text-gray-700"
          >
            Upload Resume (PDF only) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="resume"
            name="resume"
            onChange={(e) => handleFileChange(e, "resume")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            accept="application/pdf"
            required
          />
        </div>
      </div>

      {/* Grouping the Log in, Sign Up, and Reset buttons below the privacy policy */}
      <div className="col-span-12 w-full">
        {/* Terms and Conditions and Privacy Policy on top */}
        <div className="mb-4 w-full text-center sm:text-left">
          <p className="text-sm text-gray-600 overflow-hidden sm:whitespace-nowrap sm:text-ellipsis">
            By creating an account, you agree to our{" "}
            <a
              href="/terms"
              className="text-blue-600 hover:underline focus:outline-none"
            >
              terms and conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacypolicy"
              className="text-blue-600 hover:underline focus:outline-none"
            >
              privacy policy
            </a>
            .
          </p>
        </div>

        {/* Grouping the Log in, Sign Up, and Reset buttons below the privacy policy */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mt-4 space-y-4 sm:space-y-0">
          {/* Already have an account on the top (for mobile), or left (for desktop) */}
          <p className="text-sm text-black text-center sm:text-left">
            Already have an account?{" "}
            <button
              onClick={handleLogin}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Log in
            </button>
          </p>

          {/* Sign Up button in the center */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 text-md font-medium text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </div>

          {/* Reset button on the bottom (for mobile), or right (for desktop) */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 text-md font-medium text-gray-600 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset Form
          </button>
        </div>
      </div>
    </form>
  );

  const renderCompanyForm = () => (
    <form
      className="mt-8 grid grid-cols-12 gap-x-4 gap-y-4"
      onSubmit={handleSubmit}
    >
      <div className="col-span-12">
        <h2 className="text-3xl font-bold text-custom-blue">
          <Typewriter
            options={{
              autoStart: true,
              loop: true,
              delay: 50,
              strings: ["Hire People Now!", "Please Sign Up!"],
              cursor: "|",
              wrapperClassName: "typewriter-wrapper",
              cursorClassName: "typewriter-cursor",
            }}
          />
        </h2>
      </div>

      {/* Left Column */}
      <div className="col-span-12 md:col-span-6">
        <div>
          <label
            htmlFor="companyName"
            className="block text-lg font-medium text-gray-700"
          >
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={companyFormValues.companyName}
            onChange={handleInputChange}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyDescription"
            className="block text-lg font-medium text-gray-700"
          >
            Company Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="companyDescription"
            name="companyDescription"
            value={companyFormValues.companyDescription}
            onChange={handleInputChange}
            className="mt-2 w-full h-24 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyAddress"
            className="block text-lg font-medium text-gray-700"
          >
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="companyAddress"
            name="companyAddress"
            value={companyFormValues.companyAddress}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              const regex = /^[a-zA-Z0-9\s]*$/;
              if (
                !regex.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete"
              ) {
                e.preventDefault();
              }
            }}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyContactNumber"
            className="block text-lg font-medium text-gray-700"
          >
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="companyContactNumber"
            name="companyContactNumber"
            value={companyFormValues.companyContactNumber}
            onChange={handleInputChange}
            pattern="[0-9]{10,11}"
            onKeyDown={(e) => {
              // Allow numbers and basic navigation keys
              const allowedKeys = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
              ];
              if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                e.preventDefault();
              }
            }}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-12 md:col-span-6">
        <div>
          <label
            htmlFor="companyCity"
            className="block text-lg font-medium text-gray-700"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="companyCity"
            name="companyCity"
            value={companyFormValues.companyCity}
            onChange={handleInputChange}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyEmail"
            className="block text-lg font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="companyEmail"
            name="companyEmail"
            value={companyFormValues.companyEmail}
            onChange={handleInputChange}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyPassword"
            className="block text-lg font-medium text-gray-700"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="companyPassword"
              name="companyPassword"
              value={companyFormValues.companyPassword}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
            >
              <span className="material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyReEnterPassword"
            className="block text-lg font-medium text-gray-700"
          >
            Re-Enter Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showReEnterPassword ? "text" : "password"}
              id="companyReEnterPassword"
              name="companyReEnterPassword"
              value={companyFormValues.companyReEnterPassword}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowReEnterPassword(!showReEnterPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
            >
              <span className="material-symbols-outlined">
                {showReEnterPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="companyLogo"
            className="block text-lg font-medium text-gray-700"
          >
            Company Logo <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="companyLogo"
            name="companyLogo"
            onChange={(e) => handleFileChange(e, "companyLogo")}
            className="mt-2 w-full h-10 p-1 text-gray-600 bg-gray-100 rounded-lg focus:outline-none shadow-2xl border border-gray-300 focus:border-blue-500 transition duration-300"
            accept="image/*"
          />
        </div>
      </div>

      <div className="col-span-12 w-full">
        {/* Terms and Conditions and Privacy Policy on top */}
        <div className="mb-4 w-full">
          <p className="text-sm text-black whitespace-nowrap overflow-hidden text-ellipsis">
            By creating an account, you agree to our{" "}
            <a
              href="/terms"
              className="text-blue-600 hover:underline focus:outline-none"
            >
              terms and conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacypolicy"
              className="text-blue-600 hover:underline focus:outline-none"
            >
              privacy policy
            </a>
            .
          </p>
        </div>

        {/* Grouping the Log in, Sign Up, and Reset buttons below the privacy policy */}
        <div className="flex justify-between items-center w-full mt-4">
          {/* Already have an account on the left */}
          <p className="text-sm text-black">
            Already have an account?{" "}
            <button
              onClick={handleLogin}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Log in
            </button>
          </p>

          {/* Sign Up button in the center */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 text-md font-medium text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </div>

          {/* Reset button on the right */}
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-md font-medium text-gray-600 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset Form
          </button>
        </div>
      </div>
    </form>
  );

  const backgroundImageUrl =
    formType === "user"
      ? "/imgs/group-adult-workers-office-together.jpg"
      : "/imgs/pwd3.jpg";

  return (
    <section className="bg-white">
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* Toast Notifications */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
      )}
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src={backgroundImageUrl}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          {/* Gradient overlay for fade effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>

          <div className="hidden lg:relative lg:block lg:p-12 z-10">
            <a className="block text-white" href="#">
              <span className="sr-only">Home</span>
              <svg
                className="h-8 sm:h-10"
                viewBox="0 0 28 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              ></svg>
            </a>

            <div className="fade-effect-container">
              <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                <Typewriter
                  options={{
                    autoStart: true,
                    loop: true,
                    delay: 50,
                    strings: ["Welcome to PwdKa!"],
                    cursor: "|",
                    wrapperClassName: "typewriter-wrapper",
                    cursorClassName: "typewriter-cursor",
                  }}
                />
              </h2>

              <p className="mt-4 leading-relaxed text-white/90">
                Where we focus on making the workplace welcoming and accessible
                for everyone, especially Persons with Disabilities (PWD). We're
                here to help you find the right job and connect with employers
                who value inclusivity. Join us today to be part of a community
                that cares about diversity. Sign up now and start your path to a
                rewarding career.
              </p>
            </div>
          </div>
        </section>

        <main
          className="flex items-center justify-center px-8 py-12 sm:px-12 lg:col-span-7 lg:px-16 xl:col-span-6 min-h-screen bg-cover bg-center"
          style={{
            backgroundImage: "url('./imgs/pft.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="w-full">
            <div className="switchContainer max-w-xs mx-auto shadow-xl rounded-lg p-4 bg-white flex justify-start items-center gap-4 mb-8">
              <span className="switchLabel font-bold text-lg text-blue-600">
                Sign Up As:
              </span>
              <div className="switchButtons flex gap-2">
                <button
                  className={`inline-block rounded ${
                    formType === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-blue-600 text-blue-600"
                  } px-4 py-2 text-sm font-medium transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-blue-500`}
                  onClick={() => setFormType("user")}
                >
                  User
                </button>
                <button
                  className={`inline-block rounded ${
                    formType === "company"
                      ? "bg-blue-600 text-white"
                      : "border border-blue-600 text-blue-600"
                  } px-4 py-2 text-sm font-medium transition hover:scale-110 hover:shadow-xl focus:outline-none focus:ring active:bg-blue-500`}
                  onClick={() => setFormType("company")}
                >
                  Company
                </button>
              </div>
            </div>

            <div className="bg-white p-8 shadow-2xl rounded-2xl">
              {formType === "user" ? renderUserForm() : renderCompanyForm()}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Signup;
