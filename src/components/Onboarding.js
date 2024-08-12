import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import theme from '../theme';

const Onboarding = ({ onClose, isDarkMode }) => {
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();

  const steps = [
    {
      title: "Welcome to Lyrical Genius",
      content: "This is your ideal environment for songwriting. It provides a streamlined interface for composing lyrics, managing your songs, and visualizing your creative process.",
    },
    {
      title: "Would you like a guided tour?",
      content: "We can walk you through the main features of Lyrical Genius. This tour is optional and can be accessed later via the help icon next to the theme toggle.",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-6 rounded-lg shadow-lg max-w-md w-full`}>
        <button
          onClick={onClose}
          className={`absolute top-2 right-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
        >
          <X size={24} />
        </button>
        <h2 className={`text-2xl font-bold mb-4 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
          {steps[step].title}
        </h2>
        <p className={`mb-6 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
          {steps[step].content}
        </p>
        <div className="flex justify-between">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className={`flex items-center px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80`}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className={`flex items-center px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80 ml-auto`}
            >
              Next
              <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <div className="ml-auto">
              <button
                onClick={handleStartTour}
                className={`px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80 mr-2`}
              >
                Start Tour
              </button>
              <button
                onClick={handleSkipTour}
                className={`px-4 py-2 bg-[${theme.common.grey}] text-[${theme.common.white}] rounded hover:opacity-80`}
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