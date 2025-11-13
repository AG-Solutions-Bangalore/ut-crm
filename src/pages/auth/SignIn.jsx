import { App, Button, Form, Input, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PANEL_LOGIN } from "../../api";
import useFinalUserImage from "../../components/common/Logo";
import { useApiMutation } from "../../hooks/useApiMutation";
import { setCredentials } from "../../store/auth/authSlice";
import logo from "../../assets/logo-1.png";
import bgSignin from "../../assets/bg-sigin.png";

const { Title, Text } = Typography;

const SignIn = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trigger, loading } = useApiMutation();
  const token = useSelector((state) => state.auth.token);
  const finalUserImage = useFinalUserImage();

  if (token) {
    return <Navigate to="/home" replace />;
  }

  const onFinish = async (values) => {
    const { email, password } = values;

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await trigger({
        url: PANEL_LOGIN,
        method: "post",
        data: formData,
      });
      if (res.code == 200 && res.UserInfo?.token) {
        const { UserInfo, company_detils, company_image, version } = res;

        dispatch(
          setCredentials({
            token: UserInfo.token,
            tokenExpireAt: UserInfo.token_expires_at,
            user: UserInfo.user,
            userDetails: company_detils,
            userImage: company_image,
            version: version?.version_panel,
          })
        );

        navigate("/home");
      } else {
        message.error(
          res.message || "Login Failed, Please check your credentials."
        );
      }
    } catch (err) {
      message.error(
        err.response.data.message || "An error occurred during login."
      );
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

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
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
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(38, 29, 84, 0.4), rgba(61, 47, 122, 0.3), rgba(74, 54, 148, 0.25))",
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center px-8 md:px-12 py-12 bg-gradient-to-br from-white to-blue-50/30"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.div
                variants={logoVariants}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="inline-block"
              >
                <img
                  src={logo || ""}
                  alt="Logo"
                  className="h-20 mx-auto drop-shadow-lg"
                />
              </motion.div>
              <Title level={2} className="!text-gray-800 !mt-6 !mb-2">
                Welcome Back
              </Title>
              <Text className="text-gray-500 text-base">
                Sign in to continue to your account
              </Text>
            </motion.div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="w-full"
              initialValues={{
                email: "",
                password: "",
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
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your username" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter username"
                    autoFocus
                    maxLength={10}
                    className="rounded-lg hover:border-blue-400 transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(38, 29, 84, 0.08)",
                    }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                  label={
                    <span className="text-gray-700 font-medium">
                      Password <span className="text-red-500">*</span>
                    </span>
                  }
                >
                  <Input.Password
                    size="large"
                    placeholder="Enter password"
                    className="rounded-lg hover:border-blue-400 transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(38, 29, 84, 0.08)",
                    }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Form.Item className="!mb-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      className="!h-12 !rounded-lg !font-semibold !text-base shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #261d54 0%, #3d2f7a 50%, #4a3694 100%)",
                        border: "none",
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2 ml-2">
                        
                          Checking...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </Form.Item>
              </motion.div>

              <motion.div variants={itemVariants} className="text-right">
                <Link
                  to="/forget-password"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </Link>
              </motion.div>
            </Form>
          </motion.div>

          {/* Right Panel - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:flex items-center justify-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #261d54 0%, #3d2f7a 50%, #4a3694 100%)",
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
                <img
                  src={logo}
                  alt="Login Illustration"
                  className="w-64 h-64 object-contain drop-shadow-2xl"
                />
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
