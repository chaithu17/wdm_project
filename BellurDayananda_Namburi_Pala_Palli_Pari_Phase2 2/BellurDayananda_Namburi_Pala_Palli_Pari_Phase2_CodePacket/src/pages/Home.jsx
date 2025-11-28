import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  FaUsers,
  FaRocketchat,
  FaCalendarAlt,
  FaFileAlt,
  FaGraduationCap,
  FaComments,
  FaCheckCircle,
  FaStar,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserGraduate,
  FaLaptopCode,
  FaFlask,
  FaUser,
} from "react-icons/fa";
import { FaXTwitter, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import ContactForm from "../components/ContactForm";


// Change to regular scrolling (remove snap)
const scrollContainerStyle = {
  overflowY: "auto",
  height: "100vh",
};

const sectionStyle = {};

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRefAbout = useRef(null); // Separate canvasRef for About section
  const canvasRefServices = useRef(null); // Separate canvasRef for Services section
  const canvasRefFeatures = useRef(null); // Separate canvasRef for Features section
  const canvasRefPricing = useRef(null); // Separate canvasRef for Pricing section
  const canvasRefContact = useRef(null); // Add this line
  const canvasRefFooter = useRef(null); // Add canvasRef for Footer section

  // Smooth scroll on navigation
  useEffect(() => {
    const scrollTo = location?.state?.scrollTo;
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Particle animation for About section
  useEffect(() => {
    const canvas = canvasRefAbout.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 150;
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) this.twinkleSpeed *= -1;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,0,0,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure black background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Particle animation for Services section
  useEffect(() => {
    const canvas = canvasRefServices.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 150;
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) this.twinkleSpeed *= -1;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure black background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150,120,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Particle animation for Features section
  useEffect(() => {
    const canvas = canvasRefFeatures.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 150;
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) this.twinkleSpeed *= -1;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure black background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150,120,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Particle animation for Pricing section
  useEffect(() => {
    const canvas = canvasRefPricing.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 150;
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) this.twinkleSpeed *= -1;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure black background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150,120,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

// Particle animation for Contact section
  useEffect(() => {
    const canvas = canvasRefContact.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 150;
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) this.twinkleSpeed *= -1;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure black background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150,120,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Particle animation for Footer section
  useEffect(() => {
    const canvas = canvasRefFooter.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 150;
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.twinkleSpeed;
        if (this.opacity > 1 || this.opacity < 0.3) this.twinkleSpeed *= -1;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Ensure black background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150,120,255,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={scrollContainerStyle}>
      {/* HERO SECTION */}
     <section
  id="hero"
  role="banner"
  aria-labelledby="hero-title"
  style={sectionStyle}
  className="relative w-screen h-screen overflow-hidden text-center"
>
  {/* Background video (decorative only) */}
  <div className="absolute inset-0 z-0" aria-hidden="true">
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      className="w-full h-full object-cover"
    >
      <source src="/background.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
  </div>

  {/* Foreground content */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
    <h1 id="hero-title" className="text-5xl md:text-7xl font-extrabold tracking-tight">
      <span
        className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }} // improves contrast
      >
        Learn Together, Grow Together
      </span>
    </h1>

    <p className="mt-6 max-w-2xl text-lg text-gray-100">
      Join the next generation of learning with our P2P platform. Find the right people at the right time.
    </p>

    <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
      <Link
        to="/signin"
        aria-label="Get started free on the P2P platform"
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg focus:ring-4 focus:ring-pink-400"
      >
        Get Started Free
      </Link>

      <a
        href="#features"
        aria-label="Learn more about P2P features"
        className="bg-white/90 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-2xl font-semibold text-gray-900 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:bg-white focus:ring-4 focus:ring-gray-300"
      >
        Learn More
      </a>
    </div>
  </div>
</section>



      {/* FEATURES SECTION */}
  <section id="features" style={sectionStyle} className="relative w-full min-h-screen overflow-hidden">
        <canvas ref={canvasRefFeatures} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 py-20 md:py-32 mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Everything You Need to Succeed
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white">
              Powerful tools and features designed to enhance your learning experience.
            </p>
          </div>

          <div className="grid gap-8 text-left md:grid-cols-3">
            {[
              {
                title: "Peer-to-Peer Learning",
                description: "Connect with fellow students and expert tutors in your subjects of interest.",
                icon: FaUsers,
                gradient: "from-blue-500 to-blue-600",
              },
              {
                title: "Chat Support",
                description: "Get instant help through our chat feature for quick questions and study guidance.",
                icon: FaRocketchat,
                gradient: "from-purple-500 to-purple-600",
              },
              {
                title: "Smart Study Planner",
                description: "Organize your learning schedule with personalized recommendations and reminders.",
                icon: FaCalendarAlt,
                gradient: "from-green-500 to-green-600",
              },
              {
                title: "Document Management",
                description: "Upload, share, and collaborate on study materials with your peers.",
                icon: FaFileAlt,
                gradient: "from-orange-500 to-orange-600",
              },
              {
                title: "Create & Grade Exams",
                description: "Tutors can create custom exams and provide detailed feedback to students.",
                icon: FaGraduationCap,
                gradient: "from-indigo-500 to-indigo-600",
              },
              {
                title: "Real-Time Chat",
                description: "Communicate seamlessly with tutors and study groups in real-time.",
                icon: FaComments,
                gradient: "from-pink-500 to-pink-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-transparent backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white text-2xl`}
                  >
                    <feature.icon />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-white leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
  <section
    id="services"
    style={sectionStyle}
  className="relative min-h-screen py-10 md:py-16 w-screen flex flex-col justify-center bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white overflow-hidden"
  >
        <canvas ref={canvasRefServices} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 text-center mb-12 px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Our Services
            </span>
          </h2>
          <p className="max-w-4xl mx-auto text-lg text-gray-300 leading-relaxed">
            Comprehensive solutions tailored to your learning needs
          </p>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-4 px-4 max-w-4xl mx-auto">
          {[{
            title: "AI-Powered Tutor Matching",
            desc: "Find your perfect tutor based on your subject needs, learning style, and schedule.",
            benefits: ["Personalized recommendations", "Subject expertise matching", "Learning style compatibility"],
          },
          {
            title: "Flexible Peer-to-Peer Sessions",
            desc: "Join one-on-one or group study sessions that fit your schedule.",
            benefits: ["Flexible timings", "Video, audio, or chat", "Collaborative tools"],
          },
          {
            title: "Interactive Study Tools",
            desc: "Use built-in Pomodoro timers, note-makers, and study analytics.",
            benefits: ["Productivity boosters", "Collaborative note-taking", "Progress tracking"],
          },
          {
            title: "Smart Scheduling & Reminders",
            desc: "Plan efficiently with auto reminders and calendar sync.",
            benefits: ["Automated planning", "Calendar integration", "Smart notifications"],
          }].map((service, idx) => (
            <div
              key={idx}
              className="bg-transparent border border-white rounded-3xl p-4 shadow-2xl hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
              <p className="text-gray-300 mb-3 text-xs leading-relaxed">{service.desc}</p>
              <ul className="space-y-1">
                {service.benefits.map((b, i) => (
                  <li key={i} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2" />
                    <span className="text-gray-300 text-xs">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

       {/* Pricing Section */}
  <div id="pricing" style={sectionStyle} className="relative py-10 md:py-16">
        <canvas ref={canvasRefPricing} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white">
            Choose the plan that works best for you. No hidden fees.
          </p>
        </div>

        <div className="relative z-10 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: "Pay as you Go",
              price: "$15",
              period: "per session",
              description: "Perfect for occasional learning",
              features: [
                "1-on-1 personalized learning",
                "Book sessions only when you need them",
                "Flexible scheduling with any available tutor",
                "No Long term commitment"
              ],
              popular: false,
              gradient: "from-blue-500 to-blue-600"
            },
            {
              name: "Regular Learner",
              price: "$15 - $25",
              period: "per sessions",
              description: "For student wanting steady progress",
              features: [
                "Consistent sessions with your chosen tutor",
                "Structured learning path tailored to your goals",
                "Access to study tools & resources",
                "Priority scheduling and Support"
              ],
              popular: true,
              gradient: "from-purple-500 to-pink-600"
            },
            {
              name: "Committed Learner",
              price: "$20 - $40",
              period: "per session",
              description: "For students seeking maximum growth",
              features: [
                "Frequent sessions for accelerated learning",
                "Custom study plans from top tutors",
                "Premium feature unlocked( recordings,resources)",
                "Dedicated tutor support & progress tracking",
            
              ],
              popular: false,
              gradient: "from-orange-500 to-pink-600"
            }
          ].map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-transparent border border-white rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
                plan.popular ? 'border-4 border-purple-600 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white text-sm mb-4">{plan.description}</p>
                <div className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-2`}>
                  {plan.price}
                </div>
                <div className="text-white">{plan.period}</div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-white text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/signin"
                className={`block text-center py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105' 
                    : 'bg-transparent border border-white text-white hover:bg-white hover:text-gray-900'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT SECTION */}
     <section
  id="about"
  style={sectionStyle}
  className="relative min-h-screen py-20 md:py-32 w-screen flex flex-col justify-center bg-black text-white overflow-hidden"
>
  <canvas ref={canvasRefAbout} className="absolute inset-0 w-full h-full pointer-events-none" />

     <div className="relative z-10 text-center mb-12 px-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About Us
            </span>
          </h2>
          <p className="max-w-4xl mx-auto text-lg text-gray-300 leading-relaxed">
            We are a team of educators, technologists, and lifelong learners who believe that
            education should be accessible, collaborative, and personalized for everyone.
          </p>
        </div>
      </section>
      
{/* CONTACT SECTION */}
<section
  id="contact"
  style={sectionStyle}
  className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden text-white py-20 bg-black"
>
  {/* Particle Background */}
  <canvas
    ref={canvasRefContact}
    className="absolute inset-0 w-full h-full pointer-events-none"
  />

  <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
    {/* Section Heading */}
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Get In Touch
        </span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-100">
        Have questions? We'd love to hear from you. Send us a message!
      </p>
    </div>

    {/* Main Grid */}
    <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="flex flex-col justify-center flex-1 min-h-[400px]">
          <ContactForm />
        </div>

        {/* Contact Information */}
  <div className="space-y-6 flex flex-col justify-center flex-1 ">
  <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all">
          <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
          <div className="space-y-6">
            <div className="flex items-start group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <div>
                <div className="font-semibold text-gray-200 mb-1">Email</div>
                <a href="mailto:support@peertutoring.com" className="text-purple-300 hover:text-purple-200 hover:underline transition-colors">
                  support@peertutoring.com
                </a>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <FaPhone className="text-white text-xl" />
              </div>
              <div>
                <div className="font-semibold text-gray-200 mb-1">Phone</div>
                <a href="tel:+1234567890" className="text-blue-300 hover:text-blue-200 hover:underline transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                <FaMapMarkerAlt className="text-white text-xl" />
              </div>
              <div>
                <div className="font-semibold text-gray-200 mb-1">Location</div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=701+S+Nedderman+Dr,+Arlington,+TX+76019"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-pink-300 hover:underline transition-colors"
                  aria-label="Open location in Google Maps"
                >
                  701 S Nedderman Dr<br />
                  Arlington, TX 76019
                </a>
                <div className="mt-3 rounded-lg overflow-hidden border border-pink-500 shadow-lg" style={{width:'100%',maxWidth:'300px',height:'180px'}}>
                  <iframe
                    title="Google Map Location"
                    src="https://www.google.com/maps?q=701+S+Nedderman+Dr,+Arlington,+TX+76019&output=embed"
                    width="100%"
                    height="180"
                    style={{border:0}}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
  <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all">
          <h3 className="text-2xl font-bold text-white mb-6">Follow Us</h3>
          <div className="flex justify-center gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              <FaXTwitter className="text-white text-2xl" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-300"
            >
              <FaFacebook className="text-white text-2xl" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              <FaLinkedin className="text-white text-2xl" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 p-4 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
            >
              <FaInstagram className="text-white text-2xl" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* FOOTER SECTION */}
      <footer
        style={sectionStyle}
        className="relative w-full py-10 bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white overflow-hidden"
      >
        <canvas ref={canvasRefFooter} className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <a href="#about" className="text-white hover:underline">About Us</a>
            <a href="#pricing" className="text-white hover:underline">Pricing / Plans</a>
            <a href="#services" className="text-white hover:underline">Services / Features</a>
            <a href="#contact" className="text-white hover:underline">Contact Us</a>
          </div>
          <p className="text-gray-400">© 2025 P2P™ Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
