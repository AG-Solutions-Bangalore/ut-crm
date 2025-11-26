
import React from "react";
import { Button, Typography } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function NotFoundPage() {
  const nav = useNavigate();

  return (
    <main className="relative min-h-screen bg-white flex items-center justify-center px-6 py-16 overflow-hidden">
      {/* Background “NOT FOUND” text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1
          className="text-[10rem] md:text-[14rem] font-extrabold text-gray-300 opacity-20 select-none tracking-widest"
          style={{ whiteSpace: "nowrap" }}
        >
          NOT FOUND
        </h1>
      </div>

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1 flex flex-col gap-6">
          <div>
            <Title level={1} className="!m-0 !text-4xl md:!text-5xl text-black">
              Oops — Page not found
            </Title>
            <Paragraph className="!text-lg !text-gray-600 mt-3">
              The page you're looking for doesn't exist, may have been moved, or
              has a temporary issue. Try returning home or go back to the
              previous page.
            </Paragraph>
          </div>

          <div className="flex gap-3">
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => nav("/")}
            >
              Go Home
            </Button>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => nav(-1)}
            >
              Go Back
            </Button>
          </div>

          <div className="text-sm text-gray-400 mt-4">
            Tip: check the URL for typos — or try searching from the main menu.
          </div>
        </div>

        <div className="order-1 md:order-2 flex items-center justify-center">
          <div className="w-full max-w-md">
            <svg
              viewBox="0 0 800 600"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Page not found illustration"
              className="w-full h-auto"
            >
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#374151" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="1">
                  <stop offset="0%" stopColor="#f3f4f6" />
                  <stop offset="100%" stopColor="#e5e7eb" />
                </linearGradient>
                <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow
                    dx="0"
                    dy="8"
                    stdDeviation="18"
                    floodColor="#000"
                    floodOpacity="0.08"
                  />
                </filter>
              </defs>

              <rect
                x="0"
                y="0"
                width="800"
                height="600"
                rx="16"
                fill="url(#g2)"
              />

              <g transform="translate(80,80)">
                <rect
                  x="0"
                  y="30"
                  width="420"
                  height="320"
                  rx="18"
                  fill="#fff"
                  filter="url(#f1)"
                />
                <g transform="translate(280,90) scale(1.05)">
                  <circle cx="60" cy="60" r="46" fill="url(#g1)" />
                  <path
                    d="M32 60 L56 84"
                    stroke="#fff"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M56 84 L76 104"
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.18"
                  />
                </g>

                <text
                  x="40"
                  y="160"
                  fontFamily="Inter, system-ui, Arial"
                  fontSize="110"
                  fontWeight="700"
                  fill="#0b1220"
                >
                  404
                </text>

                <text
                  x="40"
                  y="205"
                  fontFamily="Inter, system-ui, Arial"
                  fontSize="16"
                  fill="#4b5563"
                >
                  Page not found
                </text>
              </g>

              <g transform="translate(520,140) rotate(-6)">
                <path
                  d="M0 50 L120 20 L80 80 L100 100 L40 90 Z"
                  fill="#0b1220"
                  opacity="0.9"
                />
                <path d="M10 60 L85 30 L70 70 Z" fill="#fff" opacity="0.08" />
                <circle cx="48" cy="48" r="12" fill="#fff" opacity="0.06" />
              </g>

              <ellipse
                cx="520"
                cy="460"
                rx="140"
                ry="30"
                fill="#000"
                opacity="0.04"
              />
              <circle cx="680" cy="80" r="30" fill="#111827" opacity="0.07" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
