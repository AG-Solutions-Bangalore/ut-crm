import { App, Button, Form, Input, Typography } from "antd";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { PANEL_SEND_PASSWORD } from "../../api";
import bgSignin from "../../assets/bg-sigin.png";
import logo from "../../assets/logo-1.png";
import useFinalUserImage from "../../components/common/Logo";
import { useApiMutation } from "../../hooks/useApiMutation";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const finalUserImage = useFinalUserImage();

  const { trigger, loading } = useApiMutation();
  const token = useSelector((state) => state.auth.token);

  if (token) {
    return <Navigate to="/home" replace />;
  }

  const onFinish = async (values) => {
    const { username, email } = values;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    try {
      const res = await trigger({
        url: PANEL_SEND_PASSWORD,
        method: "post",
        data: formData,
      });
      if (res.code == 200) {
        message.success(res.message || "Success");
      } else {
        message.error(res.message || "An error occurred during send password.");
      }
    } catch {
      message.error("An error occurred during send password");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgSignin})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(38, 29, 84, 0.4), rgba(61, 47, 122, 0.3), rgba(74, 54, 148, 0.25))",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Floating particles effect */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl mx-4 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Left Panel - Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center px-8 md:px-12 py-12 bg-gradient-to-br from-white to-purple-50/30"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              {/* <motion.div
                variants={logoVariants}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="inline-block"
              >
                <img
                  src={logo || ""}
                  alt="Logo"
                  className="h-20 mx-auto drop-shadow-lg"
                />
              </motion.div> */}
              <Title level={2} className="!text-gray-800 !mt-6 !mb-2">
                Reset Your Password
              </Title>
              <Text className="text-gray-500 text-base">
                Enter your username and email to receive reset instructions
              </Text>
            </motion.div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="w-full"
              initialValues={{
                username: "",
                email: "",
              }}
              requiredMark={false}
            >
              <motion.div variants={itemVariants}>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-medium">
                      Username <span className="text-red-500">*</span>
                    </span>
                  }
                  name="username"
                  rules={[
                    { required: true, message: "Please enter your username" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter username"
                    autoFocus
                    className="rounded-lg hover:border-purple-400 transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(38, 29, 84, 0.08)",
                    }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  label={
                    <span className="text-gray-700 font-medium">
                      Email <span className="text-red-500">*</span>
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter your email"
                    type="email"
                    className="rounded-lg hover:border-purple-400 transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(38, 29, 84, 0.08)",
                    }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item className="!mb-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      className="!h-12 !rounded-lg !font-semibold !text-base shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #261d54 0%, #3d2f7a 50%, #4a3694 100%)",
                        border: "none",
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                         
                          Processing...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </motion.div>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center mt-4">
                <Text className="text-gray-600">Remember your password? </Text>
                <Link
                  to="/"
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 hover:underline ml-1"
                >
                  Sign in
                </Link>
              </motion.div>
            </Form>

            {/* Info Box */}
            <motion.div
              variants={itemVariants}
              className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-2xl"
                >
                  💡
                </motion.div>
                <div>
                  <Text className="text-sm text-gray-600">
                    <strong className="text-gray-700">Need help?</strong> 
                    <br />
                    Contact your administrator if you don't receive the reset email within a few minutes.
                  </Text>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Panel - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:flex items-center justify-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #261d54 0%, #3d2f7a 50%, #4a3694 100%)",
            }}
          >
            {/* Animated circles background */}
            <motion.div
              className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute w-64 h-64 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
            />

            {/* Lock Icon Animation */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{
                scale: 1,
                rotate: 0,
                y: [0, -10, 0],
              }}
              transition={{
                scale: { duration: 0.5 },
                rotate: { duration: 0.5 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="relative z-10"
            >
              <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/30">
                <motion.div
                  className="relative"
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  <img
                    src={logo}
                    alt="Reset Password Illustration"
                    className="w-64 h-64 object-contain drop-shadow-2xl"
                  />
                  {/* Lock overlay effect */}
                  {/* <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <div className="text-8xl">🔐</div>
                  </motion.div> */}
                </motion.div>
              </div>
            </motion.div>

            {/* Decorative elements */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-12 h-12 border-2 border-white/20 rounded-lg"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${10 + (i % 3) * 30}%`,
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Security badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/50">
                <Text className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    🛡️
                  </motion.span>
                  Secure Password Reset
                </Text>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;