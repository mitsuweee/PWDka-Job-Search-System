import { useState } from "react";

const FrequentlyAsk = () => {
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (index) => {
    setOpenQuestions((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const faqs = [
    {
      question: "1. What is PWDka?",
      answer:
        "PWDka is a platform dedicated to empowering persons with disabilities (PWDs) by providing accessible, user-friendly services and resources.",
    },
    {
      question: "2. How do I create an account?",
      answer:
        'To create an account, click on the "Sign Up" button on the homepage and fill out the required information. You will receive a confirmation email after registration.',
    },
    {
      question: "3. What services does PWDka offer?",
      answer:
        "PWDka offers a wide range of services including job listings, community forums, and access to resources specifically designed for persons with disabilities.",
    },
    {
      question: "4. Is PWDka free to use?",
      answer:
        "Yes, PWDka is completely free to use. We are committed to providing our services at no cost to our users.",
    },
    {
      question: "5. How can I contact customer support?",
      answer:
        'You can contact our customer support team through the "Contact Us" page. Or you can send queries in our email - pwdkateam2024@gmail.com',
    },
    {
      question: "6. How can I contact customer support?",
      answer:
        'You can contact our customer support team through the "Contact Us" page. Or you can send queries in our email - pwdkateam2024@gmail.com',
    },
    {
      question: "7. Can I update my profile information?",
      answer:
        "Yes, you can update your profile information by navigating to your account settings and editing the details you wish to change.",
    },
    {
      question: "8. What PWD ID cards are accepted?",
      answer:
        "PWDka accepts government-issued PWD ID cards that are recognized by the national or local government. Please ensure that your PWD ID is valid and issued by an authorized agency to access all our services.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-8 text-blue-600 text-center">
        Frequently Asked Questions
      </h2>

      <div className="bg-blue-100 p-6 rounded-lg shadow mb-8 text-center border border-blue-300">
        <h3 className="text-xl font-bold text-blue-800 mb-4">
          Your Questions, Answered
        </h3>
        <p className="text-gray-700 mb-4">
          Welcome to the PWDka FAQ section! Here you will find answers to some
          of the most common questions our users ask. Whether you're new to the
          platform or a long-time member, this section is designed to help you
          navigate and make the most out of your experience with PWDka.
        </p>
        <p className="text-gray-700">
          We’ve compiled this list to provide quick and clear answers to
          frequently asked questions about our services, how to create and
          manage your account, the types of PWD ID cards we accept, and much
          more. If you can't find the information you're looking for here, feel
          free to reach out to our support team for further assistance.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index}>
            <button
              onClick={() => toggleQuestion(index)}
              className="w-full text-left text-lg font-semibold text-blue-600 border-b-2 border-blue-300 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {faq.question}
            </button>
            {openQuestions[index] && (
              <div className="mt-2 pl-4 text-gray-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrequentlyAsk;
