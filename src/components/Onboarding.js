import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, ChevronRight, ChevronLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import theme from '../theme';
import GuidedTour from './GuidedTour';

const FAQ = ({ isDarkMode }) => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const questions = [
    {
      question: "What is Lyrical Genius?",
      answer: "Lyrical Genius is an open-source comprehensive songwriting tool that provides an intuitive interface for composing lyrics, managing your songs, and visualizing your creative process. It was made specifically with Suno users in mind, and provides features tailored to maximizing quality of output, but it is by no means exclusive to AI-generated music. Lyrical Genius is not affiliated with Suno in any way."
    },
    {
      question: "How do I create new song lyrics?",
      answer: "You can create a new song by clicking the 'New Song' button in the sidebar. This will open a blank canvas for you to start adding sections and writing your lyrics."
    },
    {
      question: "What is a mood board?",
      answer: "A mood board is a visual tool in Lyrical Genius that allows you to collect and arrange images, colors, and text that inspire your songwriting process and nestle them into the background of your masterpieces-to-be."
    },
    {
      question: "Can I categorize my songs?",
      answer: "Yes, you can create custom categories and assign them to your songs for easy organization and retrieval."
    },
    {
      question: "How do I write good lyrics?",
      answer: "Start with emotion, not perfection. Write about what you feel most deeply right now, whether it's joy, sadness, anger, or confusion. Don't worry about crafting the perfect lyric or melody yet – just let your emotions guide your keystrokes. Trust your voice, embrace your unique experiences, and keep writing – your lyrical genius is waiting to be discovered."
    },
    {
      question: "Is my data saved automatically?",
      answer: "Yes, Lyrical Genius automatically saves your work locally as you write, ensuring you never lose your creative ideas."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="mt-4">
      <h3 className={`text-lg font-semibold mb-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
        Frequently Asked Questions
      </h3>
      {questions.map((item, index) => (
        <div key={index} className="mb-2">
          <button
            className={`flex justify-between items-center w-full p-2 text-left bg-[${isDarkMode ? theme.dark.background : theme.light.background}] hover:bg-[${theme.common.grey}] transition-colors duration-200 rounded-lg text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
            onClick={() => toggleQuestion(index)}
          >
            <span>{item.question}</span>
            {openQuestion === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openQuestion === index ? 'max-h-40' : 'max-h-0'
            }`}
          >
            <div className={`p-2 bg-[${isDarkMode ? theme.dark.input : theme.light.input}] rounded-b-lg text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SecurityAndPhilosophy = ({ isDarkMode }) => {
  const points = [
    {
      title: "Local Storage Only",
      content: "All your data is stored locally on your device. We don't have servers, so your lyrics stay private and secure."
    },
    {
      title: "Open Source",
      content: "Lyrical Genius is open source, meaning you can inspect the code to ensure it does what we say it does.",
      link: {
        text: "View the code",
        url: "https://github.com/DarkMistofWoods/lyrical_genius"
      }
    },
    {
      title: "No Tracking",
      content: "We don't track your usage or collect any personal information. Your identity and the creative process behind it is yours alone."
    },
    {
      title: "Empowering Creativity",
      content: "The philosophy of Lyrical Genius is to provide tools that enhance your creative process without getting in the way. We believe in empowering songwriters of all levels."
    },
    {
      title: "Community Driven",
      content: "As an open-source project, we welcome contributions and feedback from the community to continually improve Lyrical Genius."
    }
  ];

  return (
    <div className="mt-4">
      {points.map((point, index) => (
        <div key={index} className="mb-4">
          <h4 className={`font-semibold mb-1 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
            {point.title}
          </h4>
          <p className={`text-sm text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
            {point.content}
            {point.link && (
              <a 
                href={point.link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`ml-1 text-[${theme.common.brown}] hover:underline`}
              >
                {point.link.text}
              </a>
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

const Onboarding = ({ onClose, isDarkMode }) => {
  const [step, setStep] = useState(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const overlayTimer = setTimeout(() => setIsOverlayVisible(true), 50);
    const contentTimer = setTimeout(() => setIsContentVisible(true), 100);
    return () => {
      clearTimeout(overlayTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const steps = [
    {
      title: "Welcome to Lyrical Genius",
      content: "Lyrical Genius is your ideal environment for songwriting. It provides a streamlined interface for composing lyrics, managing your songs, and visualizing your creative process. Effortlessly take your lyrics into your favorite AI music software and watch them come to life.",
      component: <FAQ isDarkMode={isDarkMode} />
    },
    {
      title: "Security and Philosophy",
      content: "For Lyrical Genius to be truly genius, it needs to prioritize your privacy, security, and creative freedom. Here's what you need to know:",
      component: <SecurityAndPhilosophy isDarkMode={isDarkMode} />
    },
    {
      title: "Would you like a guided tour?",
      content: "We can walk you through the main features of Lyrical Genius. This tour is optional and can be accessed later via the help icon next to the theme toggle.",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setIsContentVisible(false);
      setTimeout(() => {
        setStep(step + 1);
        setIsContentVisible(true);
      }, 300);
    } else {
      handleClose();
    }
  };
  
  const handlePrev = () => {
    if (step > 0) {
      setIsContentVisible(false);
      setTimeout(() => {
        setStep(step - 1);
        setIsContentVisible(true);
      }, 300);
    }
  };

  const handleClose = () => {
    setIsContentVisible(false);
    setTimeout(() => {
      setIsOverlayVisible(false);
      setTimeout(onClose, 300);
    }, 300);
  };

  const handleStartTour = () => {
    setShowGuidedTour(true);
  };

  const handleSkipTour = () => {
    onClose();
  };

  if (showGuidedTour) {
    return <GuidedTour onClose={onClose} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
      isOverlayVisible ? 'bg-opacity-50' : 'bg-opacity-0'
    } flex items-center justify-center z-50`}>
      <div 
        className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isContentVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}] transition-colors duration-200 hover:text-[${theme.common.brown}]`}
        >
          <X size={24} />
        </button>
        <h2 className={`text-2xl font-bold mb-4 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
          {steps[step].title}
        </h2>
        <p className={`mb-6 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
          {steps[step].content}
        </p>

        {steps[step].component}
        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className={`flex items-center px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80 transition-opacity duration-200`}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className={`flex items-center px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80 transition-opacity duration-200 ml-auto`}
            >
              Next
              <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <div className="ml-auto">
              <button
                onClick={handleStartTour}
                className={`px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80 transition-opacity duration-200 mr-2`}
              >
                Start Tour
              </button>
              <button
                onClick={handleSkipTour}
                className={`px-4 py-2 bg-[${theme.common.grey}] text-[${theme.common.white}] rounded hover:opacity-80 transition-opacity duration-200`}
              >
                Skip Tour
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;