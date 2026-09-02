import React from "react";
import logo from "../assets/logo.png";
import groupusers from "../assets/groupusers.png";
import { Star } from "lucide-react";
import { SignIn } from "@clerk/react";

const Login = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-200/40 via-pink-200/40 to-purple-200/40">
      {/* Main Wrapper */}
      <div className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16 xl:px-24">
        {/* Logo */}
        <div className="mb-8 md:mb-0">
          <img
            src={logo}
            alt="Postly"
            className="w-28 md:w-32 h-auto object-contain"
          />
        </div>

        {/* Main Content */}
        <div
          className="
            min-h-[calc(100vh-110px)]
            flex
            flex-col
            md:flex-row
            items-center
            justify-center
            gap-12
            lg:gap-20
            xl:gap-28
          "
        >
          {/* ================= LEFT SIDE ================= */}
          <div
            className="
              w-full
              md:w-1/2
              max-w-xl
              flex
              flex-col
              items-start
              justify-center
            "
          >
            {/* Community Rating */}
            <div className="flex items-center gap-3 mb-5">
              <img
                src={groupusers}
                alt="Postly community"
                className="h-11 sm:h-12 md:h-14 w-auto object-contain"
              />

              <div>
                <div className="flex gap-0.5 mb-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-500 fill-amber-500"
                      />
                    ))}
                </div>

                <p className="text-xs md:text-sm text-gray-700">
                  Trusted by 10k+ creators
                </p>
              </div>
            </div>

            {/* Heading */}
            <h1
              className="
              text-4xl
              sm:text-5xl
              md:text-5xl
              lg:text-6xl
              xl:text-[62px]
              leading-[1.05]
              font-extrabold
              tracking-tight
bg-gradient-to-r from-[#FF7A00] via-[#FF2D55] to-[#C900A8] bg-clip-text text-transparent"
            >
              Share your thoughts,
              <br />
              discover new connections
            </h1>

            {/* Description */}
            <p
              className="
                mt-5
                text-lg
                md:text-xl
                leading-relaxed
                text-gray-900
                max-w-md
              "
            >
              Express yourself, meet interesting people,
              <br className="hidden sm:block" />
              and stay connected with your community on Postly.
            </p>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div
            className="
              w-full
              md:w-1/2
              flex
              justify-center
              md:justify-end
              lg:justify-center
            "
          >
            <div className="w-full max-w-[400px]">
              <SignIn
                fallbackRedirectUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "w-full shadow-xl rounded-2xl",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
