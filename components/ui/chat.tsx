"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const conversationSteps = [
  { text: "Hello! How can I help you today?", field: "issue", options: ["Printer Fix", "Text", "op"] , waitForUserInput: true },
  { text: "Please select your printer brand.", field: "brand", options: ["HP", "Canon", "Epson"] },
  { text: "Please provide your name.", field: "name", waitForUserInput: true },
  { text: "Please provide your email.", field: "email", waitForUserInput: true },
  { text: "Please provide your phone number.", field: "phone", waitForUserInput: true },
  { text: "Thank you! Here's a summary of your request:", field: "summary" },
];

const CardsChat = () => {
  const [messages, setMessages] = useState<{ text: string; fromAgent: boolean }[]>([]);
  const [queue, setQueue] = useState(conversationSteps);
  const [input, setInput] = useState('');
  const [awaitingUserInput, setAwaitingUserInput] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isSummaryDisplayed, setIsSummaryDisplayed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queue.length > 0) {
      processNextMessage();
    }
  }, [queue]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const processNextMessage = () => {
    if (queue.length === 0) return;
  
    const nextStep = queue[0];
  
    setMessages((prev) => [...prev, { text: '', fromAgent: true }]);
  
    const typingEffect = setTimeout(() => {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { text: nextStep.text, fromAgent: true }
      ]);
  
      if (nextStep.waitForUserInput) {
        setAwaitingUserInput(true);
        setCurrentField(nextStep.field);
      } else if (nextStep.options) {
        setAwaitingUserInput(true);
        setCurrentField(nextStep.field);
      } else {
        setQueue((prev) => prev.slice(1));
      }
    }, nextStep.text.length * 30);
  
    return () => clearTimeout(typingEffect);
  };
  

  const handleSendMessage = (value: string) => {
    if (!value) return;

    setMessages((prev) => [...prev, { text: value, fromAgent: false }]);
    setAnswers((prev) => ({ ...prev, [currentField!]: value }));
    setInput('');
    setAwaitingUserInput(false);

    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    });
  };

  const handleOptionSelect = (option: string) => {
    handleSendMessage(option);
  };

  const handleRestart = () => {
    setMessages([]);
    setQueue(conversationSteps);
    setAnswers({});
    setCurrentField(null);
    setIsComplete(false);
    setIsSummaryDisplayed(false);
  };

  useEffect(() => {
    if (queue.length === 0 && !isComplete) {
      setIsComplete(true);
      setIsSummaryDisplayed(true);
      localStorage.setItem('printerRequest', JSON.stringify(answers));
    }
  }, [queue]);

  return (
    <Card className="sm:w-[80%] w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background shadow-lg">
      <CardContent ref={containerRef} className="h-96 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm ${msg.fromAgent ? 'bg-muted' : 'ml-auto bg-primary text-primary-foreground'}`}
          >
            {/* <TypingEffect text={msg.text} onComplete={() => {}} /> */}

            {msg.fromAgent ? (
      <TypingEffect text={msg.text} onComplete={() => {}} />
    ) : (
      <div>{msg.text}</div>
    )}
          </div>
        ))}
        {isSummaryDisplayed && (
          <div className="mt-4 p-2 bg-gray-100 rounded-lg">
            <h4 className="font-bold">Summary:</h4>
            <p>Issue: {answers.issue || "No information provided"}</p>
            <p>Brand: {answers.brand || "No information provided"}</p>
            <p>Name: {answers.name || "No information provided"}</p>
            <p>Email: {answers.email || "No information provided"}</p>
            <p>Phone: {answers.phone || "No information provided"}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex w-full items-center space-x-2">
        {awaitingUserInput && currentField && conversationSteps.find(step => step.field === currentField)?.options ? (
          <div className="flex space-x-2">
            {conversationSteps.find(step => step.field === currentField)?.options?.map((option) => (
              <Button key={option} onClick={() => handleOptionSelect(option)}>
                {option}
              </Button>
            )) ?? []}
          </div>
        ) : awaitingUserInput ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <Button type="submit">Send</Button>
          </form>
        ) : null}
        {isComplete && (
          <Button onClick={handleRestart} className="mt-2">
            Restart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CardsChat;

interface TypingEffectProps {
  text: string;
  onComplete: () => void;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[charIndex]);
        setCharIndex(charIndex + 1);
      }, 30);

      return () => clearTimeout(timeout);
    } else {
      onComplete();
    }
  }, [charIndex, text, onComplete]);

  return <div className="mb-2">{displayText}</div>;
};
