import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import theme from '../theme';

const GuidedTour = ({ 
  onClose, 
  isDarkMode, 
  isSidebarCollapsed, 
  isPreviewCollapsed, 
  setIsSidebarCollapsed, 
  setIsPreviewCollapsed,
  dispatch 
}) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [explanationPosition, setExplanationPosition] = useState({ top: 0, left: 0 });

  const updatePositions = useCallback(() => {
    if (tourSteps[step]) {
      const targetElement = document.querySelector(tourSteps[step].target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        // Calculate position for the explanation box
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let top, left;

        switch (tourSteps[step].position) {
          case 'top':
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
          default:
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
        }

        // Adjust if the explanation box goes off-screen
        if (left < 20) left = 20;
        if (left > viewportWidth - 220) left = viewportWidth - 220;
        if (top < 20) top = 20;
        if (top > viewportHeight - 150) top = viewportHeight - 150;

        setExplanationPosition({ top, left });
      }
    }
  }, [step, tourSteps]);

  useEffect(() => {
    // Open sidebar and preview if they're closed
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
    if (isPreviewCollapsed) {
      setIsPreviewCollapsed(false);
    }

    setIsVisible(true);
    const steps = [
      {
        target: '.sidebar',
        content: 'This is your song list.\nYou can create, select, and manage your work here.',
        position: 'right',
      },
      {
        target: '.lyrics-editor',
        content: 'This is the lyrics editor. \nYou can write and edit your song lyrics here.',
        position: 'bottom',
      },
      {
        target: '.live-preview',
        content: 'This is the live preview. \nIt updates your lyrics in real-time as you write, and allows you to copy your lyrics to your clipboard so you can fulfill their potential.',
        position: 'left',
      },
      {
        target: '.toolbar',
        content: 'This is the toolbar. \nIt gives you access to various tools and features to evoke your lyrical mastery.',
        position: 'bottom',
      },
      {
        target: '.undo',
        content: 'This is the undo button. \nIf you make a mistake, you can go back in time up to 20 steps.',
        position: 'bottom',
      },
      {
        target: '.tools',
        content: 'This is the tools button. \nIt gives you access to useful resources like a dictionary, simile generator, rhyme generator, and more.',
        position: 'bottom',
      },
      {
        target: '.feedback',
        content: 'This is the feedback button. \nIf you would like to know more details about your personal lyrical capabilities, you can find some resources here.',
        position: 'bottom',
      },
      {
        target: '.focus',
        content: 'This is the focus mode button. \nClicking it allows you to clear the screen so you can focus on your lyrics one verse at a time.',
        position: 'bottom',
      },
      {
        target: '.version',
        content: 'This is the version control button. \nIf you want to make some drastic changes to the structure of your lyrics without losing what you had previously, you can create a version here.',
        position: 'bottom',
      },
      {
        target: '.moodboard',
        content: 'This is the mood board button. \nIt allows you to view, edit, and change your mood board. The mood board is to help you set the theme for your lyric-writing.',
        position: 'bottom',
      },
      {
        target: '.addSectionButton',
        content: 'This is where you can add the first section to your lyrics. \nGo ahead, give it a shot!',
        position: 'right',
      },
    ];
    setTourSteps(steps);
  }, [isSidebarCollapsed, isPreviewCollapsed, setIsSidebarCollapsed, setIsPreviewCollapsed]);

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [updatePositions]);

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (tourSteps.length === 0) {
    return null;
  }

  const currentStep = tourSteps[step];

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div
        className={`absolute z-[60] transition-all duration-300 bg-[${isDarkMode ? theme.dark.background : theme.light.background}] p-4 rounded-lg shadow-lg max-w-sm`}
        style={{
          top: `${explanationPosition.top}px`,
          left: `${explanationPosition.left}px`,
          transform: 'translate(-50%, -120%)',
        }}
      >
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}
        >
          <X size={20} />
        </button>
        <div className={`mb-4 text-[${isDarkMode ? theme.dark.text : theme.light.text}]`}>
          {currentStep.content.split('\n').map((line, index) => (
            <p key={index} className={index > 0 ? 'mt-2' : ''}>{line}</p>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded ${step === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className={`px-4 py-2 bg-[${theme.common.brown}] text-[${theme.common.white}] rounded hover:opacity-80`}
          >
            {step === tourSteps.length - 1 ? 'Finish' : <ChevronRight size={20} />}
          </button>
        </div>
      </div>
      {currentStep.target && (
        <div
          className="absolute border-2 border-[#A68477] rounded-lg transition-all duration-300 pointer-events-none"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
          }}
        ></div>
      )}
    </div>
  );
};

export default GuidedTour;