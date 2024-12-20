import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessCardVisible, setIsSuccessCardVisible] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const sendResetEmail = async () => {
    setIsSubmitting(true);

    // Create the Axios configuration
    const config = {
      method: "post",
      url: "/password/forgotpassword/email",
      headers: {
        "Content-Type": "application/json",
      },
      data: { email },
    };

    try {
      // Send POST request to the backend
      const response = await axios(config);
      console.log(response.data);

      // Display success toast
      toast.success("Password reset link has been sent to your email.");
      setIsSuccessCardVisible(true);
      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      console.error("Error sending email:", error);
      // Display error toast
      toast.error("Error sending password reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendResetEmail();
  };

  const resendEmail = async () => {
    setCountdown(60);
    sendResetEmail();
  };

  // Countdown timer effect
  useEffect(() => {
    if (isSuccessCardVisible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, isSuccessCardVisible]);

  return (
    <div className="max-w-lg mb-10 mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl">
      <Toaster position="top-center" reverseOrder={false} />
      {isSuccessCardVisible ? (
        <div className="max-w-4xl mx-auto mb-10 mt-10 p-10 bg-white rounded-xl shadow-lg space-y-8 transform transition-all hover:shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-custom-blue">
              Reset Link Sent!
            </h2>
            <p className="text-lg mt-4 text-gray-700">
              We've sent a password reset link to your email address. Please
              check your inbox and follow the instructions to reset your
              password.
            </p>
            <button
              className="mt-8 py-3 px-6 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </button>

            <p className="mt-6 text-gray-700">
              {canResend ? (
                <button
                  onClick={resendEmail}
                  className="text-blue-500 hover:underline"
                >
                  Resend Email
                </button>
              ) : (
                `You can resend the email in ${countdown}s.`
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <img src="imgs/LOGO PWDKA.png" alt="Logo" className="h-14 w-22" />
          </div>
          <h2 className="text-3xl font-bold text-custom-blue mb-4 text-center">
            Forgot Password?
          </h2>
          <p className="text-center text-gray-700 mb-6">
            Enter the email address associated with your account and we'll send
            you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Email Address:
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xl"
                placeholder="user@gmail.com"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-700">
            Don’t have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </a>
          </p>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
