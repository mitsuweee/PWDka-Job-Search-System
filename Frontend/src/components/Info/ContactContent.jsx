import React from "react";

const ContactUs = () => (
  <>
    {/*
  Heads up! 👋

  This component comes with some `rtl` classes. Please remove them if they are not needed in your project.
*/}

<section className="overflow-hidden bg-custom-bg sm:grid sm:grid-cols-2 sm:items-center">
  <div className="p-8 md:p-12 lg:px-16 lg:py-24">
    <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
      <h1 className="text-6xl font-bold text-custom-blue md:text-3xl">
       Questions? Contact Us!
      </h1>

      <p className="hidden text-gray-500 md:mt-4 md:block">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas tempus tellus etiam
        sed. Quam a scelerisque amet ullamcorper eu enim et fermentum, augue. Aliquet amet volutpat
        quisque ut interdum tincidunt duis.
      </p>

      <div className="mt-4 md:mt-8">
        <a
          href="#"
          className="inline-block rounded bg-custom-blue px-12 py-3 text-sm font-medium text-white transition hover:bg-blue-300 focus:outline-none focus:ring focus:ring-yellow-400"
        >
          pwdkateam@gmail.com
        </a>
      </div>
    </div>
  </div>

  <img
    alt=""
    src="src\imgs\pwd2.jpg"
    className="h-full w-full object-cover sm:h-[calc(100%_-_2rem)] sm:self-end sm:rounded-ss-[30px] md:h-[calc(100%_-_4rem)] md:rounded-ss-[60px]"
  />
</section>
  </>
);

export default ContactUs;
