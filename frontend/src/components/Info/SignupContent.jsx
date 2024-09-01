import React, { useState } from "react";
import axios from "axios";

const MAX_FILE_SIZE = 16777215; // 16,777,215 bytes (16MB)

const Signup = () => {
  const [formType, setFormType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);
  const [fade, setFade] = useState(true);

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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];

    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      if (file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1]; // Remove the prefix
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
      } else {
        alert("File size exceeds 16MB. Please upload a smaller file.");
      }
    } else {
      alert("Please upload a jpeg/png file.");
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

  const renderUserForm = () => (
    <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
      <div className="col-span-12">
        <h2 className="text-3xl font-bold text-custom-blue">Join us Now!</h2>
      </div>

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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 p-2 bg-white text-gray-600 rounded-lg focus:outline-none"
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
              Birthdate
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={userFormValues.birthdate}
              onChange={handleInputChange}
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 p-2 bg-white text-gray-600 rounded-lg focus:outline-none"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
                className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
                className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
            PWD ID
          </label>
          <input
            type="text"
            id="pwdID"
            name="pwdID"
            value={userFormValues.pwdID}
            onChange={handleInputChange}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
            onChange={(e) => handleFileChange(e, "idPicture")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl"
            accept="image/png, image/jpeg"
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
            onChange={(e) => handleFileChange(e, "userProfile")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl"
            accept="image/png, image/jpeg"
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
            onChange={(e) => handleFileChange(e, "selfieWithID")}
            className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-1 rounded-lg focus:outline-none shadow-2xl"
            accept="image/*"
          />
        </div>
      </div>

      <div className="col-span-12 flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2 text-lg font-medium text-white bg-gray-600 rounded-md shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = "/login")}
          className="px-6 py-2 text-lg font-medium text-white bg-green-500 rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Login
        </button>

        <button
          type="submit"
          className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </button>
      </div>
    </form>
  );

  const renderCompanyForm = () => (
    <form className="mt-8 grid grid-cols-12 gap-6" onSubmit={handleSubmit}>
      <div className="col-span-12">
        <h2 className="text-3xl font-bold text-custom-blue">
          Hire People Now!
        </h2>
      </div>

      <div className="col-span-12 md:col-span-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
              required
            />
          </div>

          <div className="col-span-2">
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
              className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
                className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
                className="mt-2 w-full h-10 text-gray-600 bg-gray-100 p-5 rounded-lg focus:outline-none shadow-2xl"
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
            htmlFor="companyLogo"
            className="block text-lg font-medium text-gray-700"
          >
            Company Logo
          </label>
          <input
            type="file"
            id="companyLogo"
            name="companyLogo"
            onChange={(e) => handleFileChange(e, "companyLogo")}
            className="mt-2 w-full h-10 p-1 text-gray-600 bg-gray-100 rounded-lg focus:outline-none shadow-2xl"
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
          type="button"
          onClick={() => (window.location.href = "/login")}
          className="px-6 py-2 text-lg font-medium text-white bg-green-500 rounded-md shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Login
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

  const backgroundImageUrl =
    formType === "user"
      ? "/imgs/group-adult-workers-office-together.jpg"
      : "/imgs/pwd3.jpg";

  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src={backgroundImageUrl}
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
