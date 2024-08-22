import React, { useState } from "react";
import axios from "axios";

const encodeFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const Signup = () => {
  const [formType, setFormType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (formType === "user") {
      setUserFormValues({ ...userFormValues, [name]: value });
    } else {
      setCompanyFormValues({ ...companyFormValues, [name]: value });
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      const base64 = await encodeFileToBase64(file);
      if (formType === "user") {
        setUserFormValues({ ...userFormValues, [name]: base64 });
      } else {
        setCompanyFormValues({ ...companyFormValues, [name]: base64 });
      }
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isCompany = formType === "company";

    const data = JSON.stringify(
      isCompany
        ? {
            name: companyFormValues.companyName.toLowerCase(),
            address: companyFormValues.companyAddress.toLowerCase(),
            city: companyFormValues.companyCity.toLowerCase(),
            description: companyFormValues.companyDescription,
            contact_number: companyFormValues.companyContactNumber,
            email: companyFormValues.companyEmail.toLowerCase(),
            password: companyFormValues.companyPassword,
            confirm_password: companyFormValues.companyReEnterPassword,
            profile_picture: companyFormValues.companyLogo, // Assuming companyLogo contains the image file data as a string or base64 encoded.
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
            formal_picture: userFormValues.profilePicture, // Assuming profilePicture contains the image file data as a string or base64 encoded.
            picture_with_id: userFormValues.selfieWithID, // Assuming selfieWithID contains the image file data as a string or base64 encoded.
            picture_of_pwd_id: userFormValues.idPicture, // Assuming idPicture contains the image file data as a string or base64 encoded.
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
        console.log(response.data);
        alert(response.data.message);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error.response?.data);
        alert(errorMessage);
      });
  };

  const commonInputStyles = {
    boxShadow: "inset 13px 13px 27px #d1dae3, inset -13px -13px 27px #f5ffff",
  };

  const renderUserForm = () => (
    <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
      <div className="col-span-12 md:col-span-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-lg font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userFormValues.firstName}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 rounded-md bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="middleInitial"
              className="block text-lg font-medium text-gray-700"
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
              className="mt-2 w-full h-10 rounded-md bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-lg font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userFormValues.lastName}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-lg font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={userFormValues.gender}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="birthdate"
              className="block text-lg font-medium text-gray-700"
            >
              Birthdate{" "}
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={userFormValues.birthdate}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-lg font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={userFormValues.address}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-lg font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={userFormValues.city}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="contactNumber"
              className="block text-lg font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              type="number"
              maxLength="11"
              id="contactNumber"
              name="contactNumber"
              value={userFormValues.contactNumber}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="disability"
              className="block text-lg font-medium text-gray-700"
            >
              Disability
            </label>
            <select
              id="disability"
              name="disability"
              value={userFormValues.disability}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
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

          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userFormValues.email}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={userFormValues.password}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none pr-10"
                style={commonInputStyles}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="reEnterPassword"
              className="block text-lg font-medium text-gray-700"
            >
              Re-Enter Password
            </label>
            <div className="relative">
              <input
                type={showReEnterPassword ? "text" : "password"}
                id="reEnterPassword"
                name="reEnterPassword"
                value={userFormValues.reEnterPassword}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none pr-10"
                style={commonInputStyles}
                required
              />
              <button
                type="button"
                onClick={() => setShowReEnterPassword(!showReEnterPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
              >
                {showReEnterPassword ? "Hide" : "Show"}
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
            PWD ID
          </label>
          <input
            type="text"
            id="pwdID"
            name="pwdID"
            value={userFormValues.pwdID}
            onChange={handleFileChange}
            className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
            style={commonInputStyles}
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="idPicture"
            className="block text-lg font-medium text-gray-700"
          >
            PWD ID Picture
          </label>
          <input
            type="file"
            id="idPicture"
            name="idPicture"
            value={userFormValues.idPicture} // Encode this image data to UTF 8
            onChange={handleInputChange}
            className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
            style={commonInputStyles}
            accept="image/*"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="profilePicture"
            className="block text-lg font-medium text-gray-700"
          >
            Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            value={userFormValues.profilePicture} // Encode this image data to UTF 8
            onChange={handleInputChange}
            className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
            style={commonInputStyles}
            accept="image/*"
            required
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="selfieWithID"
            className="block text-lg font-medium text-gray-700"
          >
            Selfie with PWD ID
          </label>
          <input
            type="file"
            id="selfieWithID"
            name="selfieWithID"
            value={userFormValues.selfieWithID} // Encode this image data to UTF 8
            onChange={handleInputChange}
            className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
            style={commonInputStyles}
            accept="image/*"
          />
        </div>
      </div>

      <div className="col-span-12 flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 text-lg shadow-xl font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-lg  shadow-xl font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </button>
      </div>
    </form>
  );

  const renderCompanyForm = () => (
    <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
      <div className="col-span-12 md:col-span-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="companyName"
              className="block text-lg font-medium text-gray-700"
            >
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={companyFormValues.companyName}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 rounded-md bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="companyDescription"
              className="block text-lg font-medium text-gray-700"
            >
              Company Description
            </label>
            <input
              type="text"
              id="companyDescription"
              name="companyDescription"
              value={companyFormValues.companyDescription}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 rounded-md bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="companyAddress"
              className="block text-lg font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              id="companyAddress"
              name="companyAddress"
              value={companyFormValues.companyAddress}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="companyCity"
              className="block text-lg font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="companyCity"
              name="companyCity"
              value={companyFormValues.companyCity}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="companyContactNumber"
              className="block text-lg font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              type="text"
              id="companyContactNumber"
              name="companyContactNumber"
              value={companyFormValues.companyContactNumber}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="companyEmail"
              className="block text-lg font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="companyEmail"
              name="companyEmail"
              value={companyFormValues.companyEmail}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none"
              style={commonInputStyles}
              required
            />
          </div>

          <div>
            <label
              htmlFor="companyPassword"
              className="block text-lg font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="companyPassword"
                name="companyPassword"
                value={companyFormValues.companyPassword}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none pr-10"
                style={commonInputStyles}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="companyReEnterPassword"
              className="block text-lg font-medium text-gray-700"
            >
              Re-Enter Password
            </label>
            <div className="relative">
              <input
                type={showReEnterPassword ? "text" : "password"}
                id="companyReEnterPassword"
                name="companyReEnterPassword"
                value={companyFormValues.companyReEnterPassword}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md h-10 bg-white text-lg text-gray-700 focus:outline-none pr-10"
                style={commonInputStyles}
                required
              />
              <button
                type="button"
                onClick={() => setShowReEnterPassword(!showReEnterPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-500"
              >
                {showReEnterPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-4">
        <div>
          <label
            htmlFor="companyLogo"
            className="block text-lg font-medium text-gray-700"
          >
            Company Logo
          </label>
          <input
            type="file"
            id="companyLogo"
            name="companyLogo"
            value={companyFormValues.companyLogo}
            onChange={handleInputChange}
            className="mt-2 w-full rounded-md bg-white text-lg text-gray-700 focus:outline-none"
            style={commonInputStyles}
            accept="image/*"
          />
        </div>
      </div>

      <div className="col-span-12 flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 text-lg font-medium text-white bg-gray-600 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Reset
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </button>
      </div>
    </form>
  );

  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="\imgs\group-adult-workers-office-together.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />

          <div className="hidden lg:relative lg:block lg:p-12">
            <a className="block text-white" href="#">
              <span className="sr-only">Home</span>
              <svg
                className="h-8 sm:h-10"
                viewBox="0 0 28 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG content here */}
              </svg>
            </a>

            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Welcome to PwdKa!
            </h2>

            <p className="mt-4 leading-relaxed text-white/90">
              Where we focus on making the workplace welcoming and accessible
              for everyone, especially Persons with Disabilities (PWD). We're
              here to help you find the right job and connect with employers who
              value inclusivity. Join us today to be part of a community that
              cares about diversity. Sign up now and start your path to a
              rewarding career.
            </p>
          </div>
        </section>

        <main className="flex items-start justify-start px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6 bg-custom-bg">
          <div className="w-full">
            <div className="switchContainer flex justify-start items-center gap-10 mb-6">
              <span className="switchLabel font-bold text-lg text-custom-blue">
                Sign up as:
              </span>
              <div className="switchButtons flex gap-4">
                <button
                  className={`switchButton ${
                    formType === "user"
                      ? "bg-blue-700 text-white"
                      : "bg-blue-500 text-white"
                  } px-4 py-2 rounded-md  shadow-xl`}
                  onClick={() => setFormType("user")}
                >
                  User
                </button>
                <button
                  className={`switchButton ${
                    formType === "company"
                      ? "bg-blue-700 text-white"
                      : "bg-blue-500 text-white"
                  } px-4 py-2 rounded-md  shadow-xl`}
                  onClick={() => setFormType("company")}
                >
                  Company
                </button>
              </div>
            </div>

            <div className="bg-custom-bg p-8  shadow-2xl rounded-2xl">
              {formType === "user" ? renderUserForm() : renderCompanyForm()}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Signup;
