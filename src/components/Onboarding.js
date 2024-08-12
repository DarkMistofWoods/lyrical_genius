import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, ChevronRight, ChevronLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import theme from '../theme';

const FAQ = ({ isDarkMode }) => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const questions = [
    {
      question: "What is Lyrical Genius?",
      answer: "Lyrical Genius is a comprehensive songwriting tool that provides an intuitive interface for composing lyrics, managing your songs, and visualizing your creative process."
    },
    {
      question: "How do I create a new song?",
      answer: "You can create a new song by clicking the 'New Song' button in the sidebar. This will open a blank canvas for you to start writing your lyrics."
    },
    {
      question: "What is a Mood Board?",
      answer: "A Mood Board is a visual tool in Lyrical Genius that allows you to collect and arrange images, colors, and text that inspire your songwriting process."
    },
    {
      question: "Can I categorize my songs?",
      answer: "Yes, you can create custom categories and assign them to your songs for easy organization and retrieval."
    },
    {
      question: "Is my data saved automatically?",
      answer: "Yes, Lyrical Genius automatically saves your work as you write, ensuring you never lose your creative ideas."
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

const Onboarding = ({ onClose, isDarkMode }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('right');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Trigger the fade-in animation after a short delay
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      title: "Welcome to Lyrical Genius",
      content: "Lyrical Genius is your ideal environment for songwriting. It provides a streamlined interface for composing lyrics, managing your songs, and visualizing your creative process.",
      component: <FAQ isDarkMode={isDarkMode} />
    },
    {
      title: "Would you like a guided tour?",
      content: "We can walk you through the main features of Lyrical Genius. This tour is optional and can be accessed later via the help icon next to the theme toggle.",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleStartTour = () => {
    // Implement the guided tour logic here
    console.log("Starting guided tour");
    onClose();
  };

  const handleSkipTour = () => {
    console.log("Skipping guided tour");
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
      isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
    } flex items-center justify-center z-50`}>
      <div 
        className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isTransitioning 
            ? (direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') 
            : 'translate-x-0 opacity-100'
        } ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={onClose}
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