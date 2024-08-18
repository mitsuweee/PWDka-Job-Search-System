import React from 'react';

const LoginComp = () => {
  return (
    <div className="min-h-[500px] px-4 py-8 flex flex-col items-center justify-center"> {/* Adjust min-height as needed */}
      <div className="bg-custom-bg rounded-xl sm:p-10 flex flex-col items-center">
        <div className="grid lg:gap-x-10 lg:grid-cols-12 lg:gap-y-8 grid-cols-1">
          <div className="hidden lg:col-span-5 lg:block">
            <img src="/imgs/smiley-woman-working-laptop.jpg" className="rounded-2xl w-full h-full object-cover" alt="Smiley woman working on laptop"/>
          </div>
          <div className="pt-8 pr-8 pb-8 pl-8 lg:col-span-7">
            <p className="text-[#007bff] text-left font-extrabold leading-snug tracking-tight mb-4 md:text-4xl">Login.</p>
            <div>
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="rounded-md w-full pt-3 pr-0 pb-3 pl-0 inline-flex items-center justify-center bg-[#007bff] text-white cursor-pointer hover:bg-gray-600">
                  <p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                      <path d="M20.283,10.356h-8.327v3.451h4.792c-0.446,2.193-2.313,3.453-4.792,3.453c-2.923,0-5.279-2.356-5.279-5.28 c0-2.923,2.356-5.279,5.279-5.279c1.259,0,2.397,0.447,3.29,1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233 c-4.954,0-8.934,3.979-8.934,8.934c0,4.955,3.979,8.934,8.934,8.934c4.467,0,8.529-3.249,8.529-8.934 C20.485,11.453,20.404,10.884,20.283,10.356z"/>
                    </svg>
                  </p>
                  <p className="text-xl">Google</p>
                </div> */}

                {/* <div className="rounded-md w-full inline-flex items-center justify-center bg-white border-2 text-gray-800 pt-3 pr-0 pb-3 pl-0 cursor-pointer border-gray-300">
                  <p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="black" className="mr-1">
                      <path d="M19.665,16.811c-0.287,0.664-0.627,1.275-1.021,1.837c-0.537,0.767-0.978,1.297-1.316,1.592 c-0.525,0.482-1.089,0.73-1.692,0.744c-0.432,0-0.954-0.123-1.562-0.373c-0.61-0.249-1.17-0.371-1.683-0.371 c-0.537,0-1.113,0.122-1.73,0.371c-0.616,0.25-1.114,0.381-1.495,0.393c-0.577,0.025-1.154-0.229-1.729-0.764 c-0.367-0.32-0.826-0.87-1.377-1.648c-0.59-0.829-1.075-1.794-1.455-2.891c-0.407-1.187-0.611-2.335-0.611-3.447 c0-1.273,0.275-2.372,0.826-3.292c0.434-0.74,1.01-1.323,1.73-1.751C7.271,6.782,8.051,6.563,8.89,6.549 c0.46,0,1.063,0.142,1.81,0.422s1.227,0.422,1.436,0.422c0.158,0,0.689-0.167,1.593-0.498c0.853-0.307,1.573-0.434,2.163-0.384 c1.6,0.129,2.801,0.759,3.6,1.895c-1.43,0.867-2.137,2.08-2.123,3.637c0.012,1.213,0.453,2.222,1.317,3.023 c0.392,0.372,0.829,0.659,1.315,0.863C19.895,16.236,19.783,16.529,19.665,16.811L19.665,16.811z M15.998,2.38 c0,0.95-0.348,1.838-1.039,2.659c-0.836,0.976-1.846,1.541-2.941,1.452c-0.014-0.114-0.021-0.234-0.021-0.36 c0-0.913,0.396-1.889,1.103-2.688c0.352-0.404,0.8-0.741,1.343-1.009c0.542-0.264,1.054-0.41,1.536-0.435 C15.992,2.127,15.998,2.254,15.998,2.38z"/>
                    </svg>
                  </p>
                  <p className="text-xl">Apple</p>
                </div> */}
              </div>
              {/* <p className="text-sm text-center text-gray-600 pt-4 pr-0 pb-2 pl-0 border-b-2 border-[#1f2937] font-bold">OR</p> */}
            </div>
            <div>
              <div className="w-full mt-3 mr-auto mb-3 ml-auto">
                <label className="block text-sm font-medium text-gray-700">Your Email</label>
                <div className="mt-1 mr-0 mb-0 ml-0">
                  <input
                    type="email"
                    placeholder="Ex: mitsui@gmail.com"
                    className="bg-[#e3edf7] border-gray-300 border rounded-[10px] shadow-[inset_20px_20px_60px_#c1c9d2,inset_-20px_-20px_60px_#ffffff] text-[#007bff] focus:ring-indigo-500 focus:border-transparent sm:text-sm w-full block h-10"
                  />
                </div>
              </div>
              <div className="w-full mt-0 mr-auto mb-3 ml-auto">
                <label className="block text-sm font-medium text-gray-700">Your Password</label>
                <div className="mt-1 mr-0 mb-0 ml-0">
                  <input
                    type="password"
                    placeholder="********"
                    className="bg-[#e3edf7] border-gray-300 border rounded-[10px] shadow-[inset_20px_20px_60px_#c1c9d2,inset_-20px_-20px_60px_#ffffff] text-[#007bff] focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-full block h-10"
                  />
                </div>
              </div>
              

              <button className="hover:bg-gray-600 rounded-md text-xl pt-3 pr-3 pb-3 pl-3 bg-[#007bff] font-semibold text-white w-full text-center">Submit</button>
              <div className="flex items-center justify-start border-t-2 border-[#1f2937] mt-6 mr-0 mb-0 ml-0 pt-6 pr-0 pb-0 pl-0">
                <p className="text-sm text-gray-800">Not a member?</p>
                <a href="/signup" className="text-sm text-[#007bff] mt-0 mr-0 mb-0 ml-2">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginComp;
